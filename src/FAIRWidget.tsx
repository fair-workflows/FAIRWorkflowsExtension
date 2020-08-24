import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Widget } from '@lumino/widgets';
import { showErrorMessage } from '@jupyterlab/apputils';
import { INotebookTracker, NotebookActions } from '@jupyterlab/notebook';
import { CodeCellModel } from '@jupyterlab/cells';
import { FAIRSearch } from './FAIRSearch'
import { FAIRManualStep } from './FAIRManualStep'

/**
 * Widget that lives in the left side bar of Jupyter Lab.
 * Displays the FAIRSearch and FAIRManualStep components, to aid user in constructing FAIR Workflows.
 * The widget can insert python code into cells in the currently selected notebook.
 */
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

    onUpdateRequest(): void {
        console.log('FAIRWorkflowsWidget onUpdateRequest()');

        ReactDOM.unmountComponentAtNode(this.node);
        ReactDOM.render(
            <div>
                <FAIRSearch injectCode={this.injectCode} />
                <FAIRManualStep injectCode={this.injectCode} getSelectedCellContents={this.getSelectedCellContents} />
            </div>, this.node);        
    }

    injectCode = (injectStr: string, nanopubURI: string): void => {
        if (!this.tracker.currentWidget) {
            showErrorMessage('Cannot inject code into cell without an active notebook', {});
            return;
        }
        const notebook = this.tracker.currentWidget.content;

        const model = notebook.model;
        if (model.readOnly) {
            showErrorMessage('Unable to inject cell into read-only notebook', {});
        }

        // Construct default cell metadata (simply a tag saying the contents were injected by this extension)
        const cellMetadata = {trusted: false, collapsed: false, tags: ['Injected by FAIR Workflows Widget'], nanopubURI: nanopubURI}

        const activeCellIndex = notebook.activeCellIndex;
        const cell = new CodeCellModel({
            cell: {
                cell_type: 'code',
                metadata: cellMetadata,
                source: [injectStr],
            },
        });
        model.cells.insert(activeCellIndex + 1, cell);
        NotebookActions.selectBelow(notebook);
    }

    getSelectedCellContents = (): any => {
        if (!this.tracker.currentWidget) {
            showErrorMessage('Cannot inspect cell contents without an active notebook', {});
            return;
        }
        const notebook = this.tracker.currentWidget.content;

        const model = notebook.model;

        const activeCellIndex = notebook.activeCellIndex;
        const content = {metadata: model.cells.get(activeCellIndex).metadata, text: model.cells.get(activeCellIndex).value.text};
        console.log(content);
        
        return content;
    }

}
