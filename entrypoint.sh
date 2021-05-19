#!/bin/bash
echo "Running entrypoint.sh"

if [[ -v NEWNANOPUBPROFILENAME ]] && [[ -v NEWNANOPUBPROFILEORCID ]]; then
    setup_nanopub_profile --orcid_id ${NEWNANOPUBPROFILEORCID} --no-publish --name ${NEWNANOPUBPROFILENAME} --newkeys
fi

if [[ -v NOTEBOOKDIR ]]; then
    JLDIR="--notebook-dir=${NOTEBOOKDIR}"
    cp -r /root/.nanopub ${NOTEBOOKDIR}/.nanopub
fi

if [[ -v PASSWDHASH ]]; then
    JLPASS="--NotebookApp.password=${PASSWDHASH}"
fi

if [[ -v CERTFILE ]]; then
    JLCERT="--certfile=${CERTFILE}"
fi

if [[ -v PKEY ]]; then
    JLKEY="--keyfile=${PKEY}"
fi

/opt/conda/bin/jupyter lab --ip=0.0.0.0 --port=8888 --allow-root ${JLDIR} ${JLPASS} ${JLCERT} ${JLKEY}
