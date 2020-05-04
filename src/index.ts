import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './FAIRWorkflowsExtension';

/**
 * Initialization data for the FAIRWorkflowsExtension extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'FAIRWorkflowsExtension',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension FAIRWorkflowsExtension is activated!');

    requestAPI<any>('nanosearch')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The FAIRWorkflowsExtension server extension appears to be missing.\n${reason}`
        );
      });
  }

//  let buttonExtension = new RunAllCellsButtonExtension();
//  app.docRegistry.addWidgetExtension('Notebook', buttonExtension);
};

export default extension;
