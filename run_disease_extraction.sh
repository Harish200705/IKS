#!/bin/bash
# Wrapper script to run disease extraction using anaconda Python

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ANACONDA_PYTHON="/opt/anaconda3/bin/python3"

echo "🚀 Starting Disease Name Extraction"
echo "Using Anaconda Python: $ANACONDA_PYTHON"
echo ""

if [ ! -f "$ANACONDA_PYTHON" ]; then
    echo "❌ Error: Anaconda Python not found at $ANACONDA_PYTHON"
    echo "Please install anaconda or update the path in this script"
    exit 1
fi

cd "$SCRIPT_DIR"
"$ANACONDA_PYTHON" process_disease_names.py

