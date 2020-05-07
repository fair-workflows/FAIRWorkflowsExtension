import * as React from 'react';
//import * as ReactDOM from 'react-dom';

import { ReactWidget, showErrorMessage } from '@jupyterlab/apputils';

import { INotebookTracker } from '@jupyterlab/notebook';

//import { ServerConnection } from '@jupyterlab/services';

export interface IProps {
    open(openas: string): void;
}

export interface IState {
    source: 'nanopub' | 'workflowhub';
}

//export class FAIRSearch extends React.Component<IProps, IState> {
//
//    constructor(props: IProps) {
//        super(props);
//        this.state = {
//            source: 'nanopub'
//        };        
//    }
//
//    setNanopubsAsSource = () => {
//        this.setState({source: 'nanopub'});
//    }
//
//    render() {
//        const style = {
//            backgroundColor: '#545b62',
//            color: '#fff',
//        };
//
//        return (
//            <div>
//                <div className="jp-Toolbar">
//                    <div className="jp-Toolbar-item jp-ToolbarButton">
//                        <button
//                            className="jp-ToolbarButtonComponent"
//                            disabled={this.state.source === 'nanopub'}
//                            onClick={this.setNanopubsAsSource}
//                            style={this.state.source === 'nanopub' ? style : {}}
//                        >
//                            FAIR Search
//                        </button>
//                    </div>
//                </div>
//            </div>
//        );
//    }
//}



export class TestWidget extends ReactWidget {
    tracker: INotebookTracker;
    constructor(tracker: INotebookTracker) {
        super();
        this.tracker = tracker
        this.title.label = 'TestWidget'
        this.id = 'testwidget';

        this.update();
    }

    onUpdateRequest() {
        console.log('RRRRRRRRR');
        this.render();
    }

    onOpen = (openas: string) => {
        if (!this.tracker.currentWidget) {
            showErrorMessage('Unable to inject cell without an active notebook', {});
            return;
        }
        const notebook = this.tracker.currentWidget.content;
        console.log(openas, notebook)
    }

    render() {
//        ReactDOM.unmountComponentAtNode(this.node);
//        ReactDOM.render(<FAIRSearch open={this.onOpen} />, this.node);        
        return (
            <div>
                <div className="jp-Toolbar">
                    <div className="jp-Toolbar-item jp-ToolbarButton">
                        <button
                            className="jp-ToolbarButtonComponent"
                            disabled={false}
                        >
                            FAIR Search
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
