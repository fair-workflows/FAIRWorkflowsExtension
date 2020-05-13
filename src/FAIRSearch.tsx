import * as React from 'react';

import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';

import { debounce } from "ts-debounce";


interface ISearchResultProps {
    uri: string;
    description: string;
    date: string;
    onClick(np: string): void;
}

export class SearchResult extends React.Component<ISearchResultProps, {}> {
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


interface IFairSearchProps {
    injectCode(uri: string, source: string): void;
}

interface IFairSearchState {
    source: 'nanopub' | 'workflowhub';
    searchtext: string;
    results: any;
}


export class FAIRSearch extends React.Component<IFairSearchProps, IFairSearchState> {
    debounced_search: ReturnType<typeof debounce>;
    constructor(props: IFairSearchProps) {
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
                            <input type="search" id="searchentry" name="searchentry" onChange={this.onSearchEntry} value={this.state.searchtext} />
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


async function requestAPI<T>(
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

