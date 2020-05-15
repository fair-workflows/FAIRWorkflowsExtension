FROM continuumio/anaconda3

ENV JUPYTER_ENABLE_LAB=yes
ENV PYTHONIOENCODING=utf-8

RUN mkdir /app
WORKDIR /app
COPY . /app
RUN conda update -n base -c defaults conda && apt-get update && apt-get install git && conda install nodejs=10.13.0 && \
    conda install -c conda-forge typescript && pip install -r requirements.txt
RUN pip install git+git://github.com/fair-workflows/FAIRWorkbench@master
RUN pip install -e .
RUN jupyter-serverextension enable --py FAIRWorkflowsExtension && \
    jlpm && jlpm build && jupyter-labextension link . && jlpm build && jupyter-lab build

CMD ["/opt/conda/bin/jupyter",  "lab", "--ip=0.0.0.0", "--port=8888", "--allow-root"]
