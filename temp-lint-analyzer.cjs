import json

with open('lint-results.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

errors = {}
for file in data:
    for message in file['messages']:
        ruleId = message['ruleId']
        if ruleId in errors:
            errors[ruleId] += 1
        else:
            errors[ruleId] = 1

for ruleId, count in sorted(errors.items(), key=lambda item: item[1], reverse=True):
    print(f'{ruleId}: {count}')
