# Install fair workflows dependency
python3 -m pip install git+git://github.com/fair-workflows/FAIRWorkbench@add_nanopub_search_things_grlc || exit 1

# Install server extension
python3 -m pip install -e . || exit 1

# Register server extension
jupyter-serverextension enable --py FAIRWorkflowsExtension || exit 1

# Install dependencies
jlpm || exit 1
# Build Typescript source
jlpm build || exit 1
# Link your development version of the extension with JupyterLab
jupyter-labextension link . || exit 1
# Rebuild Typescript source after making changes
jlpm build || exit 1
# Rebuild JupyterLab after making any changes
jupyter-lab build || exit 1
