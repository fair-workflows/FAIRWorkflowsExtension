import * as React from 'react';
import { debounce } from 'ts-debounce';
import { requestAPI } from './RequestAPI';

/** Properties of the SearchResult component */
interface ISearchResultProps {
    uri: string;
    description: string;
    date: string;
    onClick(np: string): void;
}

/**
 * A React component that renders a single Search Result.
 * Clicking on the component will trigger a call to the onClick()
 * function specified via the ISearchResultProps.
 */
export class SearchResult extends React.Component<ISearchResultProps, {}> {
    onClick = (): void => {
        this.props.onClick(this.props.uri);
    }
    render(): React.ReactElement {
        return (
            <li key={this.props.uri} title={this.props.uri}>
                <span className='jp-DirListing-item' onClick={this.onClick}>
                    {this.props.description}
                    {this.props.date}
                </span>
            </li>
        );
    }
}

/** Properties of the FAIRSearch component */
interface IFairSearchProps {
    injectCode(injectStr: string): void;
}

/** State of theFAIRSearch component */
interface IFairSearchState {
    source: 'nanopub' | 'workflowhub' | 'step';
    searchtext: string;
    results: any;
}


/**
 * A React Component adding ability to search the nanopub and workflowhub servers.
 * Search results are obtained through requests to the extension backend (running the FAIRWorkflowsExtension python lib)
 * Search input through the UI is debounced (triggered after 500 ms of inactivity). 
 */
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

    /**
     * Called when a search result option has been clicked.
     * Prompts the injection of the corresponding python code to a notebook cell.
     */
    onResultClick = (uri: string): void => {
        console.log('User selected:', uri);

        if (this.state.source === 'nanopub') {
            let code = 'np = Nanopub.fetch(\'' + uri + '\')\nprint(np)';
            this.props.injectCode(code);
        } else if (this.state.source === 'workflowhub') {
            let code = 'wf = Workflowhub.fetch(\'' + uri + '\')\nprint(wf)';
            this.props.injectCode(code);
        } else if (this.state.source === 'step') {
            let queryParams = {'np_uri': uri};
            requestAPI<any>('nanostep', queryParams)
                .then(data => {
                    let code = data
                    console.log(data)
                    this.props.injectCode(code)
                })
                .catch(reason => {
                    console.error('Nanostep load failed:\n', reason);
                });
        }
    }

    /**
     * Called when the search entry input changes. The searching is debounced,
     * triggering after 500ms of inactivity, following this change. This is to
     * reduce the number of search requests going out, while maintaining a 
     * 'real time' feel to the search.
     */
    onSearchEntry = (event: any): void => {
        this.setState({searchtext: event.target.value});
        this.debounced_search();
    }

    /**
     * Called when the search source is changed (e.g. 'nanopub' or 'workflowhub')
     */
    onSourceChange = (event: any): void => {
        this.setState({ source: event.target.value });
    }

    /**
     * Sends the appropriate search query to the backend, and obtains
     * back the search results.
     */
    search = (): void => {
        console.log('searching:', this.state.searchtext);

        let endpoint = '';
        let queryParams = {};

        if (this.state.source === 'nanopub') {
            endpoint = 'nanosearch';
            queryParams = {type_of_search: 'text', search_str: this.state.searchtext};
        } else if (this.state.source === 'workflowhub') {
            endpoint = 'workflowhub';
            queryParams = {search_str: this.state.searchtext};
        } else if (this.state.source === 'step') {
            endpoint = 'nanosearch';
            queryParams = {type_of_search: 'pattern', subj: '', pred: '', obj: 'https://www.omg.org/spec/BPMN/scriptTask'};
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

    /**
     * Renders the FAIRSearch component. <SearchResult> components are used to display
     * any currently active search results.
     */
    render(): React.ReactElement {
        console.log('Rendering FAIRSearch component')

        let searchresults = [];
        if (this.state.source === 'nanopub') {
            searchresults = this.state.results.map( (c: any) => (
                <SearchResult key={c.id} uri={c.np} description={c.v} date={c.date} onClick={this.onResultClick} />
            ));
        } else if (this.state.source === 'workflowhub') {
            searchresults = this.state.results.map( (c: any) => (
                <SearchResult key={c.id} uri={c.url} description={c.title} date={'--'} onClick={this.onResultClick} />
            ));
        } else if (this.state.source === 'step') {
            searchresults = this.state.results.map( (c: any) => (
                <SearchResult key={c.id} uri={c.np} description={c.v} date={c.date} onClick={this.onResultClick} />
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
                                <option key='select_step' value='step'>Step</option>
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
