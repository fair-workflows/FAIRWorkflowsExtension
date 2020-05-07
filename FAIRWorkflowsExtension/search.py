import asyncio
import json

from notebook.base.handlers import APIHandler
from notebook.utils import url_path_join
import tornado

import fairworkflows

class SearchHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):

        search_str = self.get_argument('search_str')
        print('Searching for', search_str)

        results = fairworkflows.Nanopub.search(search_str)

        ret = json.dumps(results)
        self.finish(ret)


def search_handler(base_url='/'):
    endpoint = url_path_join(base_url, '/nanosearch')
    print('endpoint', endpoint)
    return endpoint, SearchHandler
