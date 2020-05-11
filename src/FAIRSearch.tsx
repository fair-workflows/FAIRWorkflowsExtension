import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Widget } from "@lumino/widgets";

import { showErrorMessage } from '@jupyterlab/apputils';

import { INotebookTracker, NotebookActions } from '@jupyterlab/notebook';

import { CodeCellModel } from '@jupyterlab/cells';

import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';

import { debounce } from "ts-debounce";


export interface ISearchResultsProps {
    uri: string;
    description: string;
    date: string;
    onClick(np: string): void;
}

export class SearchResult extends React.Component<ISearchResultsProps, {}> {
    onClick = () => {
        this.props.onClick(this.props.uri);
    }
    render() {
        return (
            <li key={this.props.uri} title={this.props.uri}>
                <span className="jp-DirListing-item" onClick={this.onClick}>
                    {this.props.description}
                    {this.props.date}
                </span>
            </li>
        );
    }
}


export interface IProps {
    injectCode(uri: string, source: string): void;
}

export interface IState {
    source: 'nanopub' | 'workflowhub';
    searchtext: string;
    results: any;
}


class FAIRSearch extends React.Component<IProps, IState> {
    debounced_search: ReturnType<typeof debounce>;
    constructor(props: IProps) {
        super(props);
        this.state = {
            source: 'nanopub',
            searchtext: '',
            results: []
        };
        
        this.debounced_search = debounce(this.search, 500);
    }

    onResultClick = (uri: string) => {
        console.log("User selected:", uri);
        this.props.injectCode(uri, this.state.source);
    }

    onSearchEntry = (event: any) => {
        this.setState({searchtext: event.target.value});
        this.debounced_search();
    }

    onSourceChange = (event: any) => {
        this.setState({ source: event.target.value });
    }

    search = () => {
        console.log('searching:', this.state.searchtext);

        let endpoint = '';
        let queryParams = {};

        if (this.state.source === 'nanopub') {
            endpoint = 'nanosearch';
            queryParams = {search_str: this.state.searchtext};
        } else if (this.state.source === 'workflowhub') {
            endpoint = 'workflowhub';
            queryParams = {search_str: this.state.searchtext};
        } else {
            console.error('Source is not recognised:\n', this.state.source);
            return;
        }
 
        requestAPI<any>(endpoint, queryParams)
            .then(data => {
                this.setState({results: data});
            })
            .catch(reason => {
                console.error('Search failed:\n', reason);
            });
    }

    render() {
        console.log('Rendering FAIRSearch component')

        let searchresults = [];
        if (this.state.source === 'nanopub') {
            searchresults = this.state.results.map( (c: any) => (
                <SearchResult uri={c.np} description={c.v} date={c.date} onClick={this.onResultClick} />
            ));
        } else if (this.state.source === 'workflowhub') {
            searchresults = this.state.results.map( (c: any) => (
                <SearchResult uri={c.url} description={c.title} date={'--'} onClick={this.onResultClick} />
            ));
        }

        return (
            <div className="lm-Widget p-Widget">
                <div className="jp-KeySelector jp-NotebookTools-tool p-Widget lm-Widget" >
                    <header className="jp-RunningSessions-sectionHeader"><h2>FAIR Search</h2></header>
                    <label>
                        Source
                        <div className="jp-select-wrapper jp-mod-focused">
                            <select className='jp-mod-styled' value={this.state.source} onChange={this.onSourceChange}>
                                <option key='select_nanopub' value='nanopub'>Nanopub</option>
                                <option key='select_workflowhub' value='workflowhub'>Workflowhub</option>
                            </select>
                        </div>
                    </label>
                    <label>
                        Search
                        <div className="jp-select-wrapper">
                            <input type="text" id="searchentry" name="searchentry" onChange={this.onSearchEntry} value={this.state.searchtext} />
                        </div>
                    </label>
                </div>
                <div className="p-Widget jp-DirListing">
                    <ul className="jp-DirListing-content">
                        {searchresults}
                    </ul>
                </div>
            </div>
        );
    }
}


export interface IManualStepState {
    description: string;
}

class FAIRManualStep extends React.Component<IProps, IManualStepState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            description: ''
        };
    }

    render() {
        return (
            <div className="lm-Widget p-Widget">
                <div className="jp-KeySelector jp-NotebookTools-tool p-Widget lm-Widget" >
                    <header className="jp-RunningSessions-sectionHeader"><h2>FAIR Manual Step</h2></header>
                    <label>
                        Description
                        <div className="jp-select-wrapper">
                            <input type="text" id="manualstepdescription" name="manualstepdescription" />
                        </div>
                    </label>
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
        ReactDOM.render(
            <div>
                <FAIRSearch injectCode={this.injectCode} />
                <FAIRManualStep injectCode={this.injectCode} />
            </div>, this.node);        
    }

    injectCode = (uri: string, source: string) => {
        if (!this.tracker.currentWidget) {
            showErrorMessage('Cannot inject code into cell without an active notebook', {});
            return;
        }
        const notebook = this.tracker.currentWidget.content;
        console.log(uri, notebook);

        const model = notebook.model;
        if (model.readOnly) {
            showErrorMessage('Unable to inject cell into read-only notebook', {});
        }

        let code = '';
        if (source === 'nanopub') {
            code = "np = Nanopub.fetch('" + uri + "')\nprint(np)";
        } else if (source === 'workflowhub') {
            code = "wf = Workflowhub.fetch('" + uri + "')\nprint(wf)";
        }

        const activeCellIndex = notebook.activeCellIndex;
        const cell = new CodeCellModel({
            cell: {
                cell_type: 'code',
                metadata: { trusted: false, collapsed: false, tags: ['Injected by FAIR Workflows Widget'] },
                source: [code],
            },
        });
        model.cells.insert(activeCellIndex + 1, cell);
        NotebookActions.selectBelow(notebook);
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


