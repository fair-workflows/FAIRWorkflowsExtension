import {
    JupyterFrontEnd,
    JupyterFrontEndPlugin,
    ILayoutRestorer
} from '@jupyterlab/application';

import { INotebookTracker } from '@jupyterlab/notebook';
import { FAIRWorkflowsWidget } from './FAIRWidget'

/**
 * Initialization data for the FAIRWorkflowsExtension extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
    activate,
    id: 'FAIRWorkflowsExtension',
    autoStart: true,
    requires: [INotebookTracker, ILayoutRestorer]
};

/**
 * Activate the extension, placing the FAIRWorkflowsWidget into the left side bar of Jupyter Lab.
 */
function activate(app: JupyterFrontEnd, tracker: INotebookTracker, restorer: ILayoutRestorer) {
    console.log('JupyterLab extension FAIRWorkflowsExtension is activated!');

    console.log('Loading FAIRWorkbenchWidget...');

    const widget = new FAIRWorkflowsWidget(tracker);

    restorer.add(widget, widget.id);
    app.shell.add(widget, 'left', { rank: 700});


    console.log('...FAIRWorkbenchWidget loaded');
}

export default extension;
