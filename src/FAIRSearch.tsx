import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Widget } from "@lumino/widgets";

import { showErrorMessage } from '@jupyterlab/apputils';

import { INotebookTracker } from '@jupyterlab/notebook';

import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';

import { debounce } from "ts-debounce";


export interface INanopubProps {
    np: string;
    v: string;
    date: string;
    onClick(np: string): void;
}

export class NanopubResult extends React.Component<INanopubProps, {}> {
    onClick = () => {
        this.props.onClick(this.props.np);
    }
    render() {
        return (
            <li key={this.props.np} title={this.props.v}>
                <span className="jp-DirListing-item jp-DirListing-itemText" onClick={this.onClick}>
                    {this.props.v}
                </span>
            </li>
        );
    }
}


export interface IProps {
    open(openas: string): void;
}

export interface IState {
    source: 'nanopub' | 'workflowhub';
    searchtext: string;
    resultsjson: any;
}


class FAIRSearch extends React.Component<IProps, IState> {
    debounced_search: ReturnType<typeof debounce>;
    constructor(props: IProps) {
        super(props);
        this.state = {
            source: 'nanopub',
            searchtext: '',
            resultsjson: []
        };
        
        this.debounced_search = debounce(this.search, 500);
    }

    onResultClick = (np: string) => {
        console.log("User selected:", np)
    }

    onSearchEntry = (event: any) => {
        this.setState({searchtext: event.target.value});
        this.debounced_search();
    }

    search = () => {
        console.log('searching:', this.state.searchtext);

        requestAPI<any>('nanosearch', {search_str: this.state.searchtext})
            .then(data => {
                this.setState({resultsjson: data});
            })
            .catch(reason => {
                console.error('Search failed:\n', reason);
            });

    }

    render() {
        console.log('Rendering FAIRSearch component')
        
        const nanopubResults = this.state.resultsjson.map( (c: any) => (
            <NanopubResult np={c.np} v={c.v} date={c.date} onClick={this.onResultClick} />
        ));

        console.log({nanopubResults});

        return (
            <div>
                <div>
                    <h3>FAIR Search</h3>
                    <input type="text" id="searchentry" name="searchentry" onChange={this.onSearchEntry} value={this.state.searchtext} />
                </div>
                <div>
                    <ul>
                        {nanopubResults}
                    </ul>
                </div>
            </div>

        );
    }
}

export class FAIRWorkflowsWidget extends Widget {
    tracker: INotebookTracker;
    constructor(tracker: INotebookTracker) {
        super();
        this.tracker = tracker;
        this.title.label = 'FAIRWorkflows';
        this.title.caption = 'FAIR Workflows';
        this.id = 'fairworkflowswidget';
        this.addClass('jp-fairwidget')

        this.update();
    }

    onUpdateRequest() {
        console.log('FAIRWorkflowsWidget onUpdateRequest()');

        ReactDOM.unmountComponentAtNode(this.node);
        ReactDOM.render(<FAIRSearch open={this.onOpen} />, this.node);        
    }

    onOpen = (openas: string) => {
        if (!this.tracker.currentWidget) {
            showErrorMessage('Unable to inject cell without an active notebook', {});
            return;
        }
        const notebook = this.tracker.currentWidget.content;
        console.log(openas, notebook);
    }

}

export async function requestAPI<T>(
    endPoint = '',
    query = {},
    init: RequestInit = {}
): Promise<T> {
    // Make request to Jupyter API
    const settings = ServerConnection.makeSettings();
    const queryString = (new URLSearchParams(query)).toString();
    const requestUrl = URLExt.join(
            settings.baseUrl,
            'FAIRWorkflowsExtension', // API Namespace
            endPoint,
            ) + '?' + queryString;
    
    console.log('requestAPI called with ' + endPoint + ' ' + init + ', ' + requestUrl);

    let response: Response;
    try {
        response = await ServerConnection.makeRequest(requestUrl, init, settings);
    } catch (error) {
        throw new ServerConnection.NetworkError(error);
    }

    const data = await response.json();

    if (!response.ok) {
        throw new ServerConnection.ResponseError(response, data.message);
    }

    return data;
}


