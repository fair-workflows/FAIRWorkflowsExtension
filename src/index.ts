import {
    JupyterFrontEnd,
    JupyterFrontEndPlugin,
    ILayoutRestorer
} from '@jupyterlab/application';


import { INotebookTracker } from '@jupyterlab/notebook';

import { TestWidget } from './FAIRSearch'


/**
 * Initialization data for the FAIRWorkflowsExtension extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
    activate,
    id: 'FAIRWorkflowsExtension',
    autoStart: true,
    requires: [INotebookTracker, ILayoutRestorer]
};


function activate(app: JupyterFrontEnd, tracker: INotebookTracker, restorer: ILayoutRestorer) {
    console.log('JupyterLab extension FAIRWorkflowsExtension is activated!');

    console.log('Loading FAIRWorkbenchWidget...');

    const test = new TestWidget(tracker);

    restorer.add(test, test.id);
    app.shell.add(test, 'left', { rank: 700});


    console.log('...FAIRWorkbenchWidget loaded');
}


export default extension;
