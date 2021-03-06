FROM continuumio/miniconda3:4.7.10

ENV JUPYTER_ENABLE_LAB=yes
ENV PYTHONIOENCODING=utf-8

RUN mkdir /app
WORKDIR /app

RUN conda install -c conda-forge jupyterlab

RUN conda install -c conda-forge nodejs=12
RUN conda install -c conda-forge typescript
RUN conda install ruamel.yaml
RUN conda install openjdk

RUN apt-get update && apt-get install -y git

RUN pip install graphviz==0.14.1
RUN pip install click==7.1.2

COPY requirements.txt /app
RUN pip install -r requirements.txt

RUN pip install Pillow==8.2.0

COPY style /app/style
COPY pyproject.toml /app
COPY tsconfig.json /app
COPY LICENSE /app
COPY MANIFEST.in /app
COPY README.md /app
COPY package.json /app
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

RUN conda install -c conda-forge python-graphviz

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]

EXPOSE 8888
