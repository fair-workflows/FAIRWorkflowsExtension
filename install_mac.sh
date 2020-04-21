# Install server extension
python3 -m pip install -e .
# Register server extension
jupyter-serverextension enable --py FAIRWorkflowsExtension

# Install dependencies
jlpm
# Build Typescript source
jlpm build
# Link your development version of the extension with JupyterLab
jupyter-labextension link .
# Rebuild Typescript source after making changes
jlpm build
# Rebuild JupyterLab after making any changes
jupyter-lab build
