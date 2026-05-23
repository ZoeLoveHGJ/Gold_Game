import os
import json

path = r'C:\Users\周洪全\.gemini\antigravity\brain\fb51a09c-96dd-4b05-b350-fc0d9d838449\.system_generated\logs\overview.txt'
if os.path.exists(path):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        for idx, line in enumerate(f):
            try:
                data = json.loads(line)
                if 'content' in data:
                    print(f"Line {idx} has content key! Length: {len(data['content'])}")
                    print("Keys:", list(data.keys()))
                    # Print first 200 chars of content
                    print(repr(data['content'][:200]))
                    break
            except Exception as e:
                pass
else:
    print("Log not found")
