import json

path = r'C:\Users\周洪全\.gemini\antigravity\brain\fb51a09c-96dd-4b05-b350-fc0d9d838449\.system_generated\logs\overview.txt'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        if idx >= 670 and idx <= 680:
            try:
                data = json.loads(line)
                print(f"Line {idx}: type={data.get('type')}, keys={list(data.keys())}")
                if 'content' in data:
                    print("  content snippet:", repr(data['content'][:150]))
            except:
                pass
