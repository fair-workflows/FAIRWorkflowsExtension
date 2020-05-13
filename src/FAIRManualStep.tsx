import * as React from 'react';

interface IFairManualStepProps {
    injectCode(uri: string, source: string): void;
}

interface IFairManualStepState {
    description: string;
}

export class FAIRManualStep extends React.Component<IFairManualStepProps, IFairManualStepState> {
    constructor(props: IFairManualStepProps) {
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
                            <input type="search" id="manualstepdescription" name="manualstepdescription" />
                            <button type="button">Add step</button>
                        </div>
                    </label>
                </div>
            </div>
        );
    }
}
