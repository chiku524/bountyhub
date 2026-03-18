#!/usr/bin/env bash
# Create patches/wry with wry 0.24.11 source plus one-line fix for Linux build:
# add "use webkit2gtk::SettingsExt;" so webkit2gtk trait is in scope.
set -e
WRY_VERSION=0.24.11
PATCHES_DIR="$(cd "$(dirname "$0")/.." && pwd)/patches"
WRY_DIR="$PATCHES_DIR/wry"
MOD_RS="$WRY_DIR/src/webview/webkitgtk/mod.rs"

mkdir -p "$PATCHES_DIR"
if [[ -d "$WRY_DIR" ]]; then
  echo "patches/wry already exists, skipping"
  exit 0
fi

echo "Downloading wry $WRY_VERSION..."
curl -sL "https://static.crates.io/crates/wry/wry-$WRY_VERSION.crate" -o "$PATCHES_DIR/wry.tar.gz"
tar xzf "$PATCHES_DIR/wry.tar.gz" -C "$PATCHES_DIR"
mv "$PATCHES_DIR/wry-$WRY_VERSION" "$WRY_DIR"
rm -f "$PATCHES_DIR/wry.tar.gz"

# Add SettingsExt import after the first use block (after line 4, license comment + empty line)
if grep -q 'SettingsExt' "$MOD_RS"; then
  echo "SettingsExt already present in $MOD_RS"
else
  # Insert after "use " lines at the start - add after the first "use webkit2gtk"
  if grep -q 'use webkit2gtk' "$MOD_RS"; then
    sed -i.bak '/use webkit2gtk/a use webkit2gtk::SettingsExt;' "$MOD_RS"
    rm -f "${MOD_RS}.bak"
  else
    # Fallback: insert after line 5
    sed -i.bak '5a use webkit2gtk::SettingsExt;' "$MOD_RS"
    rm -f "${MOD_RS}.bak"
  fi
  echo "Patched $MOD_RS"
fi
