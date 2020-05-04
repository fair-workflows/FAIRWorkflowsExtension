import asyncio
import json

from notebook.base.handlers import APIHandler
from notebook.utils import url_path_join
import tornado

import fairworkflows

class SearchHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):
#        search_results = fairworkflows.Nanopub.search() 
        print(self.get_argument('search_str'))
        ret = json.dumps({"lol": "lol"})
#        ret = json.dumps({
#            "search_results": search_results})
#        print("SearchHandler called! Return string = ", ret)
        self.finish(ret)


def search_handler(base_url='/'):
    endpoint = url_path_join(base_url, '/nanosearch')
    print('endpoint', endpoint)
    return endpoint, SearchHandler
