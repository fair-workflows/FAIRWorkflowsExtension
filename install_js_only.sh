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

