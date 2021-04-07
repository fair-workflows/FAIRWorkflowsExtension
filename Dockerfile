FROM continuumio/miniconda

ENV JUPYTER_ENABLE_LAB=yes
ENV PYTHONIOENCODING=utf-8

RUN mkdir /app
WORKDIR /app
COPY . /app
RUN conda update -n base -c defaults conda && conda install python=3.7 && \
    apt-get update && apt-get install -y git && apt-get install -y graphviz && \
    conda install nodejs=10.13.0 && conda install -c conda-forge typescript && conda install ruamel.yaml && conda install openjdk && \
    pip install -r requirements.txt && pip install graphviz==0.14.1

RUN pip install -e .
RUN jupyter-serverextension enable --py FAIRWorkflowsExtension
RUN jlpm && jlpm build && jupyter-labextension link . && jlpm build && jupyter-lab build

CMD ["/opt/conda/bin/jupyter",  "lab", "--ip=0.0.0.0", "--port=8888", "--allow-root"]
