import * as React from 'react';
import { requestAPI } from './RequestAPI';

/** Properties of the FAIRManualStep component */
interface IFairManualStepProps {
    injectCode(injectStr: string, nanopubURI: string): void;
    getSelectedCellContents(): any;
}

/** State of the FAIRManualStep component */
interface IFairManualStepState {
    description: string;
}

/**
 * A React Component aiding in the creation of a FAIR Manual Step.
 */
export class FAIRManualStep extends React.Component<IFairManualStepProps, IFairManualStepState> {
    constructor(props: IFairManualStepProps) {
        super(props);
        this.state = {
            description: ''
        };
    }

    onClick = (): void => {
        const manualstep_code = "manualstep('" + this.state.description + "', completed=False, byWhom='', remarks='')";
        this.props.injectCode('# ' + this.state.description + '\n' + manualstep_code, '');
    }

    publish = (): void => {
        var content = this.props.getSelectedCellContents();
        var nanopubURI = content.metadata.get('nanopubURI');
        var description = content.text;

        const queryParams = {'derived_from': nanopubURI, 'description': description};
        requestAPI<any>('nanopublish', queryParams)
            .then(data => {
                    console.log(data);
                })
                .catch(reason => {
                    console.error('Nanopublish failed:\n', reason);
                });
        
    }

    onChange = (event: any): void => {
        this.setState({ description: event.target.value });
    }

    render(): React.ReactElement {
        return (
            <div className="lm-Widget p-Widget">
                <div className="jp-KeySelector jp-NotebookTools-tool p-Widget lm-Widget" >
                    <header className="jp-RunningSessions-sectionHeader"><h2>FAIR Manual Step</h2></header>
                    <label>
                        Description
                        <div className="jp-select-wrapper">
                            <input type="search" id="manualstepdescription" name="manualstepdescription" onChange={this.onChange} value={this.state.description} />
                            <button type="button" onClick={this.onClick}>Add step</button>
                        </div>
                        <button type="button" onClick={this.publish}>Publish</button>
                    </label>
                </div>
            </div>
        );
    }
}
