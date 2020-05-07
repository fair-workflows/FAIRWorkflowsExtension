import * as React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';

import { INotebookTracker } from '@jupyterlab/notebook';

//import { ServerConnection } from '@jupyterlab/services';

export class FAIRSearch extends React.Component<string, string> {

    constructor(props: string) {
        super(props);
    }

    render() {
        return (
            <div className="p-Widget">
                    <label>FAIR Search</label>
            </div>
        );
    }

}


export class TestWidget extends ReactWidget {
    tracker: INotebookTracker;
    constructor(tracker: INotebookTracker) {
        super();
        this.tracker = tracker
        this.id = 'testwidget';
        this.update();
    }

    onUpdateRequest() {
        console.log('RRRRRRRRR')
    }

    render() {
        return (
            <div className="p-Widget">
                    <label>FAIR Search</label>
            </div>
        );
    }
}
