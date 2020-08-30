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
    injectCode(injectStr: string, nanopubURI: string): void;
}

/** State of theFAIRSearch component */
interface IFairSearchState {
    source: 'nanopub';
    pplantype: 'step' | 'plan';
    injectiontype: 'python' | 'raw';
    loading: boolean;
    searchtext: string;
    results: any;
}


/**
 * A React Component adding ability to search the nanopub servers.
 * Search results are obtained through requests to the extension backend (running the FAIRWorkflowsExtension python lib)
 * Search input through the UI is debounced (triggered after 500 ms of inactivity). 
 */
export class FAIRSearch extends React.Component<IFairSearchProps, IFairSearchState> {
    debounced_search: ReturnType<typeof debounce>;
    constructor(props: IFairSearchProps) {
        super(props);
        this.state = {
            source: 'nanopub',
            pplantype: 'step',
            injectiontype: 'python',
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
            if (this.state.injectiontype === 'python') {
                this.fetchAndInjectNanopubPython(uri);
            } else if (this.state.injectiontype === 'raw') {
                this.fetchAndInjectNanopubRaw(uri);
            }
        }
    }

    /**
     * Fetch specified nanopub (given by URI) and extract the Plex step or workflow contained within.
     * If found, inject the step(s) as one or more cells in the notebook. 
     */
    fetchAndInjectNanopubRaw = (uri: string): void => {
        if (this.state.pplantype === 'step' || this.state.pplantype === 'plan') {
            this.setState({loading: true});
            const queryParams = {'np_uri': uri};
            requestAPI<any>('nanostep', queryParams)
                .then(data => {
                    console.log(data)
                    for (const code_step of data) {
                        this.props.injectCode(code_step.description, code_step.nanopubURI);
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
     * Inject python code to load the FairStep or FairWorkflow described by the given URI.
     */
    fetchAndInjectNanopubPython = (uri: string): void => {
        if (this.state.pplantype === 'step') {
            const code = "from fairworkflows import FairStep\nstep=FairStep(uri='" + uri + "', from_nanopub=True)\nprint(step)\n";
            this.props.injectCode(code, uri);
        } else {
            const code = "from fairworkflows import FairWorkflow\nworkflow=FairWorkflow(uri='" + uri + "', from_nanopub=True)\nprint(workflow)\n";
            this.props.injectCode(code, uri);
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
     * Called when the search source is changed (e.g. 'nanopub' or 'fairdatapoint')
     */
    onSourceChange = (event: any): void => {
        this.setState({ source: event.target.value, results: [], searchtext: '' });
    }

    /**
     * Called when the pplan type is changed (e.g. 'step' or 'plan')
     */
    onPPlanTypeChange = (event: any): void => {
        this.setState({ pplantype: event.target.value });
    }

    /**
     * Called when the injection type is changed (e.g. 'python' or 'raw')
     */
    onInjectionTypeChange = (event: any): void => {
        this.setState({ injectiontype: event.target.value });
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
            if (this.state.pplantype === 'step') {
                queryParams = {type_of_search: 'things', thing_type: 'http://purl.org/net/p-plan#Step', searchterm: this.state.searchtext};
            } else if (this.state.pplantype === 'plan') {
                queryParams = {type_of_search: 'things', thing_type: 'http://purl.org/net/p-plan#Plan', searchterm: this.state.searchtext};
            }
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

        // Display the results in the appropriate format for either nanopub (or other) searches
        let searcharea = (<span className="jp-fairwidget-busy">Loading...</span>);
        if (this.state.loading === false) {
            let searchresults = [];
            if (this.state.source === 'nanopub') {
                searchresults = this.state.results.map( (c: any) => (
                    <SearchResult key={c.id} uri={c.np} description={c.description} date={c.date} onClick={this.onResultClick} />
                ));
            }

            searcharea = (<ul className="jp-DirListing-content">{searchresults}</ul>);
        }

        let pplan_type_selection = null;
        if (this.state.source === 'nanopub') {
            pplan_type_selection = (
                <label>
                    Type
                    <div className="jp-select-wrapper jp-mod-focused">
                        <select className='jp-mod-styled' value={this.state.pplantype} onChange={this.onPPlanTypeChange}>
                            <option key='select_step' value='step'>#Step</option>
                            <option key='select_plan' value='plan'>#Plan</option>
                        </select>
                    </div>
                </label>
            );
        }


        let injection_type_selection = null;
        if (this.state.results.length > 0 && this.state.loading === false) {
            injection_type_selection = (
                <label>
                    Inject
                    <div className="jp-select-wrapper jp-mod-focused">
                        <select className='jp-mod-styled' value={this.state.injectiontype} onChange={this.onInjectionTypeChange}>
                            <option key='select_python' value='python'>python</option>
                            <option key='select_raw' value='raw'>raw</option>
                        </select>
                    </div>
                </label>
            );
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
                            </select>
                        </div>
                    </label>

                    {pplan_type_selection}
                    <label>
                        Search
                        <div className="jp-select-wrapper">
                            <input type="search" id="searchentry" name="searchentry" onChange={this.onSearchEntry} value={this.state.searchtext} />
                        </div>
                    </label>

                    {injection_type_selection}
                </div>

                <div className="p-Widget jp-DirListing">
                    {searcharea}
                </div>
            </div>
        );
    }
}


