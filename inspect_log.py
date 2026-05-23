import os
path = r'C:\Users\周洪全\.gemini\antigravity\brain\fb51a09c-96dd-4b05-b350-fc0d9d838449\.system_generated\logs\overview.txt'
if os.path.exists(path):
    print("Log exists! Size:", os.path.getsize(path))
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        for i in range(100):
            line = f.readline()
            if not line:
                break
            print(f"{i}: {repr(line)}")
else:
    print("Log does not exist at:", path)
