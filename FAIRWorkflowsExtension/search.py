import asyncio
import json

from notebook.base.handlers import APIHandler
from notebook.utils import url_path_join
import tornado

import fairworkflows

class NanopubSearchHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):

        type_of_search = self.get_argument('type_of_search')

        if type_of_search == 'text':
            search_str = self.get_argument('search_str')
            print('Searching for', search_str)
            results = fairworkflows.Nanopub.search_text(search_str)
        elif type_of_search == 'pattern':
            subj = self.get_argument('subj')
            pred = self.get_argument('pred')
            obj = self.get_argument('obj')
            print('Searching for pattern', subj, pred, obj)
            results = fairworkflows.Nanopub.search_pattern(subj=subj, pred=pred, obj=obj)
        else:
            raise ValueError(f'Unrecognized type_of_search, {type_of_search}')

        ret = json.dumps(results)
        self.finish(ret)

def nanopub_search_handler(base_url='/'):
    endpoint = url_path_join(base_url, '/nanosearch')
    return endpoint, NanopubSearchHandler


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


#g = np.data
#qres = g.query(
#    """SELECT DISTINCT ?code
#       WHERE {
#          ?a <http://purl.org/dc/elements/1.1/description> ?code .
#       }""")
#print([i for i in qres])
