import asyncio
import json

from notebook.base.handlers import APIHandler
from notebook.utils import url_path_join
import tornado

class SearchHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post, 
    # patch, put, delete, options) to ensure only authorized user can request the 
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({
            "data": "This is /FAIRWorkflowsExtension/get_example endpoint!"
        }))


class SearchHandler(IPythonHandler):
    """
    Nanopublish cell
    """
    async def get(self):
#        catalog_url = self.get_argument('catalog_url')
#        self.set_header('Content-Type', 'application/json')
#        c = ThreddsConfig(config=self.config)
#        loop = asyncio.get_event_loop()
#        crawler = TDSCrawler(catalog_url, loop, maxtasks=c.maxtasks)
#        try:
#            datasets = await asyncio.wait_for(crawler.run(), c.timeout)
#
#            self.finish(json.dumps(sorted(datasets, key=lambda d: d['id'])))
#        except CrawlerError as e:
#            self.set_status(500)
#            self.set_header('Content-Type', 'application/problem+json')
#            # Use https://tools.ietf.org/html/draft-ietf-appsawg-http-problem-00 format
#            error = {
#                "title": str(e),
#                "url": e.url
#            }
#            self.finish(json.dumps(error))
        self.finish(json.dumps({'Search': 'example'}))


def search_handler(base_url='/'):
    endpoint = url_path_join(base_url, '/nanosearch')
    return endpoint, SearchHandler
