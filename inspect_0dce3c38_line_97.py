import json

path = r'C:\Users\周洪全\.gemini\antigravity\brain\0dce3c38-c054-4196-be06-1ca59fc025dd\.system_generated\logs\overview.txt'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        if idx == 97:
            try:
                data = json.loads(line)
                print("KEYS:", list(data.keys()))
                content = data.get("content", "")
                print("CONTENT LENGTH:", len(content))
                print("CONTENT SNIPPET:")
                print(repr(content[:500]))
            except Exception as e:
                print("Error:", e)
            break
