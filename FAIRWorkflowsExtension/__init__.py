from ._version import __version__ 

from .search import search_handler


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
    base_url = web_app.settings['base_url']
    handlers = [
        search_handler(base_url) 
    ]
    web_app.add_handlers('.*$', handlers)

    nb_server_app.log.info("Registering FAIRWorkflowsExtension handlers")
