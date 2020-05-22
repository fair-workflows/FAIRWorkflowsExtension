import asyncio
import json

from notebook.base.handlers import APIHandler
from notebook.utils import url_path_join
import tornado

from urllib.parse import urldefrag

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


class NanopubStepHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):

        np_uri = self.get_argument('np_uri')

        print(np_uri)

        # Fetch the nanopub at the given URI
        np = fairworkflows.Nanopub.fetch(np_uri)
        print(np)

        # Look for first step (if exists)
        first_step_URI = self.get_first_step(np.data)

        if first_step_URI is not None:
            step_URIs = [first_step_URI]
            step_URIs += self.get_subsequent_steps(np.data)

            steps = []
            for step_uri in step_URIs:
                print(step_uri, type(step_uri))
                step_np = fairworkflows.Nanopub.fetch(step_uri)
                steps.append(self.get_step_from_nanopub(step_np.data))

        else:
            # If not a workflow, return the step description in this NP
            steps = [self.get_step_from_nanopub(np.data)]
            
        ret = json.dumps(steps)
        self.finish(ret)

    def get_step_from_nanopub(self, np_rdf):
        # Get the description triple
        qres = np_rdf.query(
         """SELECT DISTINCT ?code
            WHERE {
               ?a <http://purl.org/dc/elements/1.1/description> ?code .
            }""")

        qres_list = list([i for i in qres])
        if len(qres_list) > 0:
            result = qres_list[0]
        else:
            result = '# No step found at nanopub URI: ' + np_uri


        print('Returning step:', result)
        return result

    def get_first_step(self, np_rdf):
        qres = np_rdf.query(
         """SELECT DISTINCT ?firstStepURI
            WHERE {
               ?a <http://purl.org/spar/pwo/hasFirstStep> ?firstStepURI .
            }""")

        uri_list = []
        for row in qres:
            uri = str(row['firstStepURI'].toPython())
            uri_without_fragment = urldefrag(uri)[0]
            uri_list.append(uri_without_fragment)

        print('uri_list', uri_list)
        if len(uri_list) == 0:
            return None
        elif len(uri_list) > 1:
            print("Warning: More than one first step declared.")

        return uri_list[0]

    def get_subsequent_steps(self, np_rdf):
        qres = np_rdf.query(
         """SELECT DISTINCT ?stepURI
            WHERE {
               ?a <http://ontologydesignpatterns.org/wiki/Ontology:DOLCE+DnS_Ultralite/precedes> ?stepURI .
            }""")

        uri_list = []
        for row in qres:
            uri = str(row['stepURI'].toPython())
            uri_without_fragment = urldefrag(uri)[0]
            uri_list.append(uri_without_fragment)

        print('uri_list', uri_list)
        return uri_list

def nanopub_step_handler(base_url='/'):
    endpoint = url_path_join(base_url, '/nanostep')
    return endpoint, NanopubStepHandler
