import json
path = r'C:\Users\周洪全\.gemini\antigravity\brain\fb51a09c-96dd-4b05-b350-fc0d9d838449\.system_generated\logs\overview.txt'

with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        try:
            data = json.loads(line)
            content = data.get("content", "")
            if 'main.ts' in content.lower():
                print(f"Line {idx} matches: keys = {list(data.keys())}, content snippet = {repr(content[:150])}")
        except:
            pass
