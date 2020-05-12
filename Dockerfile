FROM ubuntu

ENV JUPYTER_ENABLE_LAB=yes

RUN mkdir /app
WORKDIR /app
COPY . /app
RUN apt-get update  && apt-get install -y curl && \
curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh && bash nodesource_setup.sh && \
apt-get update && apt-get install -y curl python3 python3-pip git nodejs && \
pip3 install -r requirements.txt
RUN pip3 install git+git://github.com/fair-workflows/FAIRWorkbench@fairworkflows
RUN jlpm build
RUN pip3 install -e .
RUN jupyter-serverextension enable --py FAIRWorkflowsExtension && \
    jlpm && jlpm build && jupyter-labextension link . && jlpm build && jupyter-lab build

CMD ["/usr/local/bin/jupyter",  "lab", "--ip=0.0.0.0", "--port=8888", "--allow-root"]