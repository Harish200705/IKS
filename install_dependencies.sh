#!/bin/bash
# Install python-docx with user flag to avoid system package manager issues

echo "Installing python-docx..."
python3 -m pip install --user python-docx

echo ""
echo "✅ Installation complete!"
echo "Now run: python3 process_disease_names.py"

