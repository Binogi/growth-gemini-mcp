#!/bin/bash
# Format edited files after Claude makes changes
FILE_PATH=$(cat | jq -r '.tool_input.file_path // empty')
if [[ "$FILE_PATH" == *.ts || "$FILE_PATH" == *.js ]]; then
  npx prettier --write "$FILE_PATH" 2>/dev/null
  npx eslint --fix "$FILE_PATH" 2>/dev/null
fi
exit 0
