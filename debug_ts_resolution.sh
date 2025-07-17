#!/bin/bash

# Check if a file path is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <typescript_file_path>"
  exit 1
fi

FILE_PATH="$1"
LOG_FILE="ts_resolution_trace.log"
FILTERED_LOG_FILE="ts_resolution_summary.log"
TSCONFIG_FILE="tsconfig.json"

# Save original tsconfig.json content
ORIGINAL_TSCONFIG=$(cat "$TSCONFIG_FILE")

# Temporarily modify tsconfig.json to include only the target file
TEMP_INCLUDE="  \"include\": [\"next-env.d.ts\", \"$FILE_PATH\"]\n"

# Use sed to replace the include line. This assumes 'include' is on a single line.
sed -i "/\"include\":/c\$TEMP_INCLUDE" "$TSCONFIG_FILE"

echo "Running TypeScript trace resolution for $FILE_PATH..."
npx tsc --noEmit --traceResolution -p "$TSCONFIG_FILE" > "$LOG_FILE" 2>&1

echo "Filtering relevant lines from $LOG_FILE..."
grep -E "module resolution|failed lookup|Cannot find module" "$LOG_FILE" > "$FILTERED_LOG_FILE"

# Restore original tsconfig.json content
echo "$ORIGINAL_TSCONFIG" > "$TSCONFIG_FILE"

echo "Trace resolution complete. Full log in $LOG_FILE, summary in $FILTERED_LOG_FILE."
echo "Please review $FILTERED_LOG_FILE and provide its content."