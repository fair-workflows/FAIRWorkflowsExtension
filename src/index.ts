import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { FAIRWorkbenchWidget } from './FAIRWorkflowsExtension';

/**
 * Initialization data for the FAIRWorkflowsExtension extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  activate,
  id: 'FAIRWorkflowsExtension',
  autoStart: true
};


function activate(app: JupyterFrontEnd) {
  console.log('JupyterLab extension FAIRWorkflowsExtension is activated!');

  console.log('Loading FAIRWorkbenchWidget...');
  app.docRegistry.addWidgetExtension('Notebook', new FAIRWorkbenchWidget());

  console.log('...FAIRWorkbenchWidget loaded');
}


export default extension;
