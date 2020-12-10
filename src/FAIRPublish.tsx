import * as React from 'react';
import { requestAPI } from './RequestAPI';

/** Properties of the FAIRPublish component */
interface IFairPublishProps {
    injectCode(injectStr: string, nanopubURI: string): void;
    getSelectedCellContents(): any;
    setCellMetadata(metadata_key: string, metadata_value: string): any;
}

/** State of the FAIRPublish component */
interface IFairPublishState {
    selectedCellSourceURI: string;
}

/**
 * A React Component aiding in the creation of a FAIR Manual Step.
 */
export class FAIRPublish extends React.Component<IFairPublishProps, IFairPublishState> {
    interval: number;

    constructor(props: IFairPublishProps) {
        super(props);
        this.state = {
            selectedCellSourceURI: '',
        };
        this.interval = null;
    }

    publish = (): void => {
        const content = this.props.getSelectedCellContents();
        const description = content.text;

        let nanopubURI = content.metadata.get('nanopubURI');
        if (typeof nanopubURI === 'undefined') {
            nanopubURI = '';
        }

        const queryParams = {'derived_from': nanopubURI, 'description': description};
        requestAPI<any>('nanopublish', queryParams)
            .then(data => {
                console.log(data);
                console.log('published_URI=' + data['published_URI'])
                this.props.setCellMetadata('nanopubURI', data['published_URI'])
            })
            .catch(reason => {
                console.error('Nanopublish failed:\n', reason);
            });
    }

    tick() {
        const content = this.props.getSelectedCellContents();
        let nanopubURI = '';
        if (typeof content !== 'undefined') {
            nanopubURI = content.metadata.get('nanopubURI');
            if (typeof nanopubURI === 'undefined') {
                nanopubURI = '';
            }
        }
        console.log(content);

        this.setState(state => ({
            selectedCellSourceURI: nanopubURI
        }));
    }

    componentDidMount = (): void => {
        this.interval = setInterval(() => this.tick(), 300);
    }

    componentWillUnmount = (): void => {
        clearInterval(this.interval);
    }

    render(): React.ReactElement {
        let displaySourceURI = null;
        if (this.state.selectedCellSourceURI) {
            displaySourceURI = ( <div><p>Selected cell source URI:</p> <a href={this.state.selectedCellSourceURI} className="fairlink"> {this.state.selectedCellSourceURI}</a></div> );
        } else {
            displaySourceURI = ( <div><p>Selected cell is unpublished.</p></div> );
        }

        return (
            <div className="lm-Widget p-Widget">
                <div className="jp-KeySelector jp-NotebookTools-tool p-Widget lm-Widget" >
                    <header className="jp-RunningSessions-sectionHeader"><h2>FAIR Publish</h2></header>
                    <label>
                        <button type="button" onClick={this.publish}>Publish Cell</button>
                    </label>
                </div>
                <div className="jp-KeySelector jp-NotebookTools-tool p-Widget lm-Widget" >
                    {displaySourceURI}
                </div>
            </div>
        );
    }
}
