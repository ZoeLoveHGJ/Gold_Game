import os
import json

path = r'C:\Users\周洪全\.gemini\antigravity\brain\fb51a09c-96dd-4b05-b350-fc0d9d838449\.system_generated\logs\overview.txt'
if os.path.exists(path):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        for i in range(100):
            line = f.readline()
            if not line:
                break
            try:
                data = json.loads(line)
                print(f"Keys: {list(data.keys())}")
                if 'content' in data:
                    print("Has content! Length:", len(data['content']))
                # Print sample
                print(str(data)[:200])
            except Exception as e:
                print("Error parsing:", e)
