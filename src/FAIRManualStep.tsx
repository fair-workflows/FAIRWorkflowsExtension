import * as React from 'react';

/** Properties of the FAIRManualStep component */
interface IFairManualStepProps {
    injectCode(injectStr: string): void;
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
        let code = 'Manual Step:\n' + this.state.description;
        this.props.injectCode(code);
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
                    </label>
                </div>
            </div>
        );
    }
}
