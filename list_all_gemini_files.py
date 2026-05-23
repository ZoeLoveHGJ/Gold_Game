import os

gemini_dir = r'C:\Users\周洪全\.gemini\antigravity'
ts_files = []

for root, dirs, files in os.walk(gemini_dir):
    for file in files:
        if file.endswith(('.ts', '.js', '.txt', '.json', '.py', '.md')):
            file_path = os.path.join(root, file)
            try:
                size = os.path.getsize(file_path)
                if size > 10000 and 'node_modules' not in file_path:
                    # Let's see if it has 'chooseBonusMission' or 'main.ts'
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        head = f.read(2000)
                    # Skip logs overview
                    if 'overview.txt' in file_path:
                        continue
                    ts_files.append((file_path, size, head[:200]))
            except Exception:
                pass

print(f"Found {len(ts_files)} interesting files:")
for path, size, snippet in ts_files:
    print(f"Path: {path} (Size: {size} bytes)")
    print(f"  Snippet: {repr(snippet)}")
