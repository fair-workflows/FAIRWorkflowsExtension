from ._version import __version__ 
from .search import nanopub_search_handler, workflowhub_search_handler, nanopub_step_handler
from notebook.utils import url_path_join

def _jupyter_server_extension_paths():
    return [{
        "module": "FAIRWorkflowsExtension"
    }]


def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.
    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """
    web_app = nb_server_app.web_app
    base_url = url_path_join(web_app.settings['base_url'], 'FAIRWorkflowsExtension')
    handlers = [
        nanopub_search_handler(base_url),
        workflowhub_search_handler(base_url),
        nanopub_step_handler(base_url)
    ]
 
    print('Registering handlers:', handlers)
    nb_server_app.log.info("Registering FAIRWorkflowsExtension handlers")
    
    web_app.add_handlers('.*$', handlers)

