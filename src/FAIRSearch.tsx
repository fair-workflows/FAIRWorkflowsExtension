import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Widget } from "@lumino/widgets";

import { showErrorMessage } from '@jupyterlab/apputils';

import { INotebookTracker } from '@jupyterlab/notebook';

//import { ServerConnection } from '@jupyterlab/services';

export interface IProps {
    open(openas: string): void;
}

export interface IState {
    source: 'nanopub' | 'workflowhub';
}


class DataExplorer extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            source: 'nanopub'
        };        
    }


    render() {
        console.log('Rendering DataExplorer')
        return (
            <div>
                <h1>AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA</h1>
            </div>
        );
    }
}

export class TestWidget extends Widget {
    tracker: INotebookTracker;
    constructor(tracker: INotebookTracker) {
        super();
        this.tracker = tracker;
        this.title.label = 'TestWidget';
        this.title.caption = 'FAIR Workbench';
        this.id = 'testwidget';
        this.addClass('jp-fairwidget')

        this.update();
    }

    onUpdateRequest() {
        console.log('TestWidget onUpdateRequest()');

        ReactDOM.unmountComponentAtNode(this.node);
        ReactDOM.render(<DataExplorer open={this.onOpen} />, this.node);        
    }

    onOpen = (openas: string) => {
        if (!this.tracker.currentWidget) {
            showErrorMessage('Unable to inject cell without an active notebook', {});
            return;
        }
        const notebook = this.tracker.currentWidget.content;
        console.log(openas, notebook)
    }

}
