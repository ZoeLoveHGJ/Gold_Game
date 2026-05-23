import os

gold_dir = r'e:\Work\Code\Web\Gold'
matches = []

for root, dirs, files in os.walk(gold_dir):
    if 'node_modules' in root or '.git' in root or 'dist' in root:
        continue
    for file in files:
        file_path = os.path.join(root, file)
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            if 'mission' in content.lower() or 'bonus' in content.lower():
                matches.append((file_path, len(content)))
        except Exception:
            pass

print("Found matching files in workspace:")
for path, size in matches:
    print(f"  {path} (Size: {size} bytes)")
