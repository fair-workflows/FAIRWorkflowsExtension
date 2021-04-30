FROM continuumio/miniconda

ENV JUPYTER_ENABLE_LAB=yes
ENV PYTHONIOENCODING=utf-8

RUN conda update -n base -c defaults conda && conda install python=3.7 && \
    apt-get update && apt-get install -y git && apt-get install -y graphviz && \
    conda install nodejs=10.13.0 && conda install -c conda-forge typescript && conda install ruamel.yaml && conda install openjdk
RUN pip install graphviz==0.14.1

RUN mkdir /app
WORKDIR /app

COPY requirements.txt /app
RUN pip install -r requirements.txt

COPY style /app/style
COPY pyproject.toml /app
COPY tsconfig.json /app
COPY tsconfig.tsbuildinfo /app
COPY LICENSE /app
COPY MANIFEST.in /app
COPY README.md /app
COPY package.json /app
COPY yarn.lock /app
COPY jupyter-config /app/jupyter-config

COPY setup.py /app
COPY FAIRWorkflowsExtension /app/FAIRWorkflowsExtension
COPY src /app/src

RUN pip install -e .
RUN jupyter-serverextension enable --py FAIRWorkflowsExtension
RUN jlpm
RUN jlpm build
RUN jupyter-labextension link .
RUN jlpm build
RUN jupyter-lab build

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]
