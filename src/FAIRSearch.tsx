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
                    <p>{this.props.description}</p>
                    <p>{this.props.date}</p>
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
    source: 'nanopub' | 'workflowhub';
    nanopubtype: 'step' | 'plan';
    loading: boolean;
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
            nanopubtype: 'plan',
            loading: false,
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
            this.fetchAndInjectNanopub(uri);
        } else if (this.state.source === 'workflowhub') {
            this.fetchAndInjectCWL(uri);
        }
    }

    /**
     * Fetch specified nanopub (given by URI) and extract the Plex step or workflow contained within.
     * If found, inject the step(s) as one or more cells in the notebook. 
     */
    fetchAndInjectNanopub = (uri: string): void => {
        if (this.state.nanopubtype === 'step' || this.state.nanopubtype === 'plan') {
            this.setState({loading: true});
            const queryParams = {'np_uri': uri};
            requestAPI<any>('nanostep', queryParams)
                .then(data => {
                    console.log(data)
                    this.props.injectCode('from fairworkflows import manualstep')
                    for (const code_step of data) {
                        const manualstep_code = "manualstep('" + code_step + "', completed=False, byWhom='', remarks='')";
                        this.props.injectCode('#' + code_step + '\n' + manualstep_code);
                    }
                    this.setState({loading: false, results: []});
                })
                .catch(reason => {
                    console.error('Nanostep load failed:\n', reason);
                    this.setState({loading: false});
                });
        }
    }

    /**
     * Fetch RO-Crate (at specified URI) and extract the CWL workflow contained within.
     * If found, inject as one or more cells in the notebook. 
     */
    fetchAndInjectCWL = (uri: string): void => {
        this.setState({loading: true});
        const queryParams = {'uri': uri};
        requestAPI<any>('workflowhubfetch', queryParams)
            .then(data => {
                console.log(data)
                for (const code_step of data) {
                    this.props.injectCode(code_step);
                }
                this.setState({loading: false, results: []});
            })
            .catch(reason => {
                console.error('Nanostep load failed:\n', reason);
                this.setState({loading: false});
            });
 
        //this.setState({loading: true});
        //const code = 'wf = Workflowhub.fetch(\'' + uri + '\')\nprint(wf)';
        //this.props.injectCode(code);
        //this.setState({loading: false, results: []});
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
        this.setState({ source: event.target.value, results: [], searchtext: '' });
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
            if (this.state.nanopubtype === 'step') {
                queryParams = {type_of_search: 'things', thing_type: 'https://purl.org/net/p-plan#Step', searchterm: this.state.searchtext};
            } else if (this.state.nanopubtype === 'plan') {
                queryParams = {type_of_search: 'things', thing_type: 'http://purl.org/net/p-plan#Plan', searchterm: this.state.searchtext};
            }
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

    /**
     * Renders the FAIRSearch component. <SearchResult> components are used to display
     * any currently active search results.
     */
    render(): React.ReactElement {
        console.log('Rendering FAIRSearch component')

        // Display the results in the appropriate format for either nanopub or workflowhub searches
        let searcharea = (<span className="jp-fairwidget-busy">Loading...</span>);
        if (this.state.loading === false) {
            let searchresults = [];
            if (this.state.source === 'nanopub') {
                searchresults = this.state.results.map( (c: any) => (
                    <SearchResult key={c.id} uri={c.np} description={c.description} date={c.date} onClick={this.onResultClick} />
                ));
            } else if (this.state.source === 'workflowhub') {
                searchresults = this.state.results.map( (c: any) => (
                    <SearchResult key={c.id} uri={c.url} description={c.title} date={'--'} onClick={this.onResultClick} />
                ));
            }

            searcharea = (<ul className="jp-DirListing-content">{searchresults}</ul>);

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
                    {searcharea}
                </div>
            </div>
        );
    }
}


