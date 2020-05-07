//import * as React from 'react';
//import * as ReactDOM from 'react-dom';

import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';


import {
  ToolbarButton, InputDialog
} from '@jupyterlab/apputils';

import {
  IDisposable, DisposableDelegate
} from '@lumino/disposable';

import {
  NotebookPanel, INotebookModel
} from '@jupyterlab/notebook';

import { DocumentRegistry } from '@jupyterlab/docregistry';


export class FAIRWorkbenchWidget implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
  /**
   * Create a new extension object.
   */
  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    let callback = () => {
      requestAPI<any>('nanosearch?search_str=fair')
        .then(data => {
          console.log(data);
        })
        .catch(reason => {
          console.error('The FAIRWorkflowsExtension server extension appears to be missing.\n${reason}');
      });

    };


    // Request a text
    InputDialog.getText({ title: 'Provide a text' }).then(value => {
      console.log('text ' + value.value);
    });

    let button = new ToolbarButton({
      className: 'myButton',
      iconClass: 'jp-NotebookIcon',
      onClick: callback,
      tooltip: 'FAIR Search'
    });

    panel.toolbar.insertItem(0, 'runAll', button);
    return new DisposableDelegate(() => {
      button.dispose();
    });
  }
}


/**
 * Call the API extension
 *
 * @param endPoint API REST end point for the extension
 * @param init Initial values for the request
 * @returns The response body interpreted as JSON
 */
export async function requestAPI<T>(
    endPoint = '',
    init: RequestInit = {}
): Promise<T> {
    // Make request to Jupyter API
    const settings = ServerConnection.makeSettings();
    const requestUrl = URLExt.join(
            settings.baseUrl,
            'FAIRWorkflowsExtension', // API Namespace
            endPoint
            );

    console.log('requestAPI called with ' + endPoint + ' ' + init + ', ' + requestUrl);

    let response: Response;
    try {
        response = await ServerConnection.makeRequest(requestUrl, init, settings);
    } catch (error) {
        throw new ServerConnection.NetworkError(error);
    }

    const data = await response.json();

    if (!response.ok) {
        throw new ServerConnection.ResponseError(response, data.message);
    }

    return data;
}

