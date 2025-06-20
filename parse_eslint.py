import json

total_errors = 0
total_warnings = 0
total_fatal_errors = 0
errors_by_rule = {}
warnings_by_rule = {}
fixable_errors = 0
fixable_warnings = 0
files_with_errors = 0
files_with_warnings = 0

with open("eslint-output.json", "r") as f:
    eslint_data = json.load(f)

for item in eslint_data:
    total_errors += item.get("errorCount", 0)
    total_warnings += item.get("warningCount", 0)
    total_fatal_errors += item.get("fatalErrorCount", 0)
    fixable_errors += item.get("fixableErrorCount", 0)
    fixable_warnings += item.get("fixableWarningCount", 0)
    if item.get("errorCount", 0) > 0:
        files_with_errors +=1
    if item.get("warningCount", 0) > 0:
        files_with_warnings +=1
    for message in item.get("messages",[]):
        if message.get("ruleId") is not None:
            if message.get("severity") == 2: # ESLint severity 2 is an error
                errors_by_rule[message.get("ruleId")] = errors_by_rule.get(message.get("ruleId"),0) + 1
            elif message.get("severity") == 1: # ESLint severity 1 is a warning
                warnings_by_rule[message.get("ruleId")] = warnings_by_rule.get(message.get("ruleId"),0) + 1

print(f"Total Errors: {total_errors}")
print(f"Total Warnings: {total_warnings}")
print(f"Total Fatal Errors: {total_fatal_errors}") # This is a subset of total_errors
print(f"Fixable Errors: {fixable_errors}")
print(f"Fixable Warnings: {fixable_warnings}")
print(f"Files with Errors: {files_with_errors}")
print(f"Files with Warnings: {files_with_warnings}")
print(f"Errors by Rule: {json.dumps(errors_by_rule)}")
print(f"Warnings by Rule: {json.dumps(warnings_by_rule)}")
