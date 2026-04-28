#!/bin/bash
# EAS Build prebuild script
# Adds use_modular_headers! to Podfile for Firebase Swift compatibility

set -e

PODFILE="ios/Podfile"

if [ -f "$PODFILE" ]; then
  # Check if use_modular_headers! already exists
  if ! grep -q "use_modular_headers!" "$PODFILE"; then
    # Add use_modular_headers! after the platform line
    sed -i.bak "/^platform :ios/a\\
# Enable modular headers for Firebase Swift compatibility\\
use_modular_headers!
" "$PODFILE"
    rm -f "$PODFILE.bak"
    echo "Added use_modular_headers! to Podfile"
  else
    echo "use_modular_headers! already exists in Podfile"
  fi
else
  echo "Podfile not found at $PODFILE"
fi
