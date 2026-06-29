#!/usr/bin/env bash
set -euo pipefail

# Configuration
ZIP_URL="https://dcc-bs.github.io/documentation/dcc-skills.zip"
TEMP_ZIP="/tmp/dcc-skills.zip"
TEMP_DIR="/tmp/dcc-skills-extract"

echo "========================================="
echo "   DCC Coding Agent Skills Installer"
echo "========================================="

# 1. Download zip archive
echo "📥 Fetching skills archive from GitHub Pages..."
curl -sSL -o "$TEMP_ZIP" "$ZIP_URL"

# 2. Extract files
echo "📦 Extracting files..."
rm -rf "$TEMP_DIR" && mkdir -p "$TEMP_DIR"
unzip -q -o "$TEMP_ZIP" -d "$TEMP_DIR"

# 3. Install in the current repository
echo "🔧 Installing to .agents/skills/ in this repository..."
mkdir -p .agents/skills
cp -r "$TEMP_DIR"/.agents/skills/* .agents/skills/

# 4. Clean up
rm -rf "$TEMP_DIR" "$TEMP_ZIP"

echo ""
echo "✅ DCC Skills have been successfully configured!"
echo "Coding agents working in this directory will now automatically follow these guidelines."
echo "========================================="
