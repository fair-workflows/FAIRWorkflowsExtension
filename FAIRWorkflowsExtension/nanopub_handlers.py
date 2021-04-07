import json

from notebook.base.handlers import APIHandler
from notebook.utils import url_path_join
import tornado

from urllib.parse import urldefrag

import rdflib

import fairworkflows
import nanopub
from nanopub import NanopubClient


class NanopubSearchHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):

        client = NanopubClient()

        type_of_search = self.get_argument('type_of_search')

        if type_of_search == 'text':
            search_str = self.get_argument('search_str')
            print('Searching for', search_str)
            client.find_nanopubs_with_text(search_str)
        elif type_of_search == 'pattern':
            subj = self.get_argument('subj')
            pred = self.get_argument('pred')
            obj = self.get_argument('obj')
            print('Searching for pattern', subj, pred, obj)
            results = client.find_nanopubs_with_pattern(subj=subj, pred=pred, obj=obj)
        elif type_of_search == 'things':
            thing_type = self.get_argument('thing_type')
            searchterm = self.get_argument('searchterm')
            print('Searching for "thing"', thing_type, searchterm)
            if not searchterm:
                searchterm = ' '
            results = client.find_things(thing_type, searchterm=searchterm)
        else:
            raise ValueError(f'Unrecognized type_of_search, {type_of_search}')

        ret = json.dumps(list(results))
        self.finish(ret)


def nanopub_search_handler(base_url='/'):
    endpoint = url_path_join(base_url, '/nanosearch')
    return endpoint, NanopubSearchHandler


class NanopublishHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):
        derived_from = rdflib.term.URIRef(self.get_argument('derived_from'))
        description = self.get_argument('description')

        # Make a new 'empty' step
        step = fairworkflows.FairStep()

        # Specify various characteristics needed to describe it
        step.label = 'Cell from a Jupyter Lab notebook'
        step.description = description
        step.is_manual_task = False

        if len(derived_from) != 0:
            step.set_attribute(predicate=nanopub.namespaces.PROV.wasDerivedFrom, value=derived_from)

        # Print the RDF description of the step
        print(step)

        # Publish the step as a nanopublication for others to find
        publication_info = step.publish_as_nanopub()

        ret = json.dumps({'published_URI': publication_info['nanopub_uri']})
        self.finish(ret)


def nanopublish_handler(base_url='/'):
    endpoint = url_path_join(base_url, '/nanopublish')
    return endpoint, NanopublishHandler


class NanopubStepHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):
        client = NanopubClient()

        np_uri = self.get_argument('np_uri')

        print('Fetching nanopub from', np_uri)

        # Fetch the nanopub at the given URI
        np = client.fetch(np_uri)
        print(np)

        # Look for first step (if exists)
        first_step_URI = self.get_first_step(np.rdf)

        if first_step_URI is not None:
            step_URIs = [first_step_URI]
            step_URIs += self.get_subsequent_steps(np.rdf)

            steps = []
            for step_uri in step_URIs:
                print(step_uri, type(step_uri))
                step_np = client.fetch(step_uri)
                steps.append({'nanopubURI': step_uri, 'description': self.get_step_from_nanopub(step_np.rdf, step_uri)})

        else:
            # If not a workflow, return the step description in this NP
            print('No first step found - assuming this np describes a step')
            steps = [{'nanopubURI': np_uri, 'description': self.get_step_from_nanopub(np.rdf, np_uri)}]

        ret = json.dumps(steps)
        self.finish(ret)

    def get_step_from_nanopub(self, np_rdf, np_uri):
        # Get the description triple
        qres = np_rdf.query(
         """SELECT DISTINCT ?code
            WHERE {
               ?a <http://purl.org/dc/terms/description> ?code .
            }""")

        qres_list = list([i for i in qres])
        if len(qres_list) > 0:
            # Get description as string
            result = str(qres_list[0][0])

            # TODO: Find better solution than this hack to get the function name from the code.
            func_name = None
            for line in result.splitlines():
                print(line, type(line))
                line = str(line)
                if line.startswith('def'):
                    func_name = line.split('(')[0].split('def')[1].strip()
                    break
            if func_name:
                result += "\n\n" + func_name + "._fairstep.derived_from='" + np_uri + "'\n"
        else:
            result = '# No step description found. Nanopub rdf was:\n' + np_rdf.serialize(format='trig').decode('utf-8')

        print('Returning step:', result)
        return result

    def get_first_step(self, np_rdf):
        qres = np_rdf.query(
         """SELECT DISTINCT ?firstStepURI
            WHERE {
               ?a <http://purl.org/spar/pwo#hasFirstStep> ?firstStepURI .
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
               ?a <http://www.ontologydesignpatterns.org/ont/dul/DUL.owl#precedes> ?stepURI .
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
