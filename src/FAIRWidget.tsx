import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Widget } from "@lumino/widgets";

import { showErrorMessage } from '@jupyterlab/apputils';

import { INotebookTracker, NotebookActions } from '@jupyterlab/notebook';

import { CodeCellModel } from '@jupyterlab/cells';

import { FAIRSearch } from './FairSearch'
import { FAIRManualStep } from './FairManualStep'


export class FAIRWorkflowsWidget extends Widget {
    tracker: INotebookTracker;
    constructor(tracker: INotebookTracker) {
        super();
        this.tracker = tracker;
        this.title.label = 'FAIRWorkflows';
        this.title.caption = 'FAIR Workflows';
        this.id = 'fairworkflowswidget';
        this.addClass('jp-fairwidget')

        this.update();
    }

    onUpdateRequest() {
        console.log('FAIRWorkflowsWidget onUpdateRequest()');

        ReactDOM.unmountComponentAtNode(this.node);
        ReactDOM.render(
            <div>
                <FAIRSearch injectCode={this.injectCode} />
                <FAIRManualStep injectCode={this.injectCode} />
            </div>, this.node);        
    }

    injectCode = (uri: string, source: string) => {
        if (!this.tracker.currentWidget) {
            showErrorMessage('Cannot inject code into cell without an active notebook', {});
            return;
        }
        const notebook = this.tracker.currentWidget.content;
        console.log(uri, notebook);

        const model = notebook.model;
        if (model.readOnly) {
            showErrorMessage('Unable to inject cell into read-only notebook', {});
        }

        let code = '';
        if (source === 'nanopub') {
            code = "np = Nanopub.fetch('" + uri + "')\nprint(np)";
        } else if (source === 'workflowhub') {
            code = "wf = Workflowhub.fetch('" + uri + "')\nprint(wf)";
        }

        const activeCellIndex = notebook.activeCellIndex;
        const cell = new CodeCellModel({
            cell: {
                cell_type: 'code',
                metadata: { trusted: false, collapsed: false, tags: ['Injected by FAIR Workflows Widget'] },
                source: [code],
            },
        });
        model.cells.insert(activeCellIndex + 1, cell);
        NotebookActions.selectBelow(notebook);
    }
}
