import os
path = r'C:\Users\周洪全\.gemini\antigravity\brain\0dce3c38-c054-4196-be06-1ca59fc025dd\.system_generated\logs\overview.txt'
print("Size of overview.txt:", os.path.getsize(path))

with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

lines = text.split('\n')
for i, line in enumerate(lines[-500:]):
    if '1737:' in line or '1063:' in line:
        print(f"Found line match: {line[:100]}")
