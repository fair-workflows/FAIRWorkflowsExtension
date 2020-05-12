FROM ubuntu

ENV JUPYTER_ENABLE_LAB=yes

RUN mkdir /app
WORKDIR /app
COPY . /app

RUN apt-get update && apt-get install -y python3 python3-pip npm git && pip3 install -r requirements.txt
RUN pip3 install git+git://github.com/fair-workflows/FAIRWorkbench@fairworkflows
RUN pip3 install -e .
RUN jupyter-serverextension enable --py FAIRWorkflowsExtension && \
    jlpm && jlpm build && jupyter-labextension link . && jlpm build && jupyter-lab build

CMD jupyter lab


