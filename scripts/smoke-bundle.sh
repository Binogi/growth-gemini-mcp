#!/usr/bin/env bash
# Runs bundle/gemini-mcp.mjs from an empty directory, the way the Claude Code plugins run it:
# no node_modules anywhere near it. Fails if the bundle cannot load, or if the proxy setup
# cannot find undici (a dependency the bundler did not include).
set -uo pipefail
BUNDLE=$(realpath "${1:-bundle/gemini-mcp.mjs}")
DIR=$(mktemp -d)
trap 'rm -rf "$DIR"' EXIT
cp "$BUNDLE" "$DIR/gemini-mcp.mjs"
cd "$DIR" || exit 1
OUT=$(HTTP_PROXY=http://127.0.0.1:9 VERBOSE=true node gemini-mcp.mjs --help 2>&1)
STATUS=$?
if [ $STATUS -ne 0 ]; then echo "$OUT" >&2; echo "smoke-bundle: exit $STATUS" >&2; exit 1; fi
if grep -q "Failed to inject proxy agent" <<<"$OUT"; then
  grep "Proxy" <<<"$OUT" >&2; echo "smoke-bundle: proxy setup failed in the bundle" >&2; exit 1
fi
echo "smoke-bundle: ok"
