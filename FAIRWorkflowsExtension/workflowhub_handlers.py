import asyncio
import json

from notebook.base.handlers import APIHandler
from notebook.utils import url_path_join
import tornado

import fairworkflows

class WorkflowhubSearchHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):

        search_str = self.get_argument('search_str')
        print('Searching for', search_str)

        results = fairworkflows.Workflowhub.search(search_str)

        ret = json.dumps(results)
        self.finish(ret)


def workflowhub_search_handler(base_url='/'):
    endpoint = url_path_join(base_url, '/workflowhub')
    return endpoint, WorkflowhubSearchHandler



class WorkflowhubFetchHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):

        uri = self.get_argument('uri')
        print('Fetching RO-Crate from Workflowhub at uri=', uri)

        wf = fairworkflows.Workflowhub.fetch(uri)
        print('cwltool extracted at', wf.cwltool)

        cwlcontents = []
        with open(wf.cwltool, 'r') as cwlfile:
            cwlcontents = [cwlfile.read()]

        ret = json.dumps(cwlcontents)
        self.finish(ret)


def workflowhub_fetch_handler(base_url='/'):
    endpoint = url_path_join(base_url, '/workflowhubfetch')
    return endpoint, WorkflowhubFetchHandler
