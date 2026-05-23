import os
import re

history_dir = r'C:\Users\周洪全\AppData\Roaming\Code\User\History'

if os.path.exists(history_dir):
    print("VS Code History directory exists! Scanning...")
    matches = []
    # Search all subdirectories recursively for files containing 'chooseBonusMission'
    for root, dirs, files in os.walk(history_dir):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                # Check size first to avoid huge files
                if os.path.getsize(file_path) > 10000:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    if 'chooseBonusMission' in content or 'awardCleanSweepIfNeeded' in content:
                        print(f"Found match: {file_path} (Size: {len(content)} chars)")
                        matches.append((file_path, len(content)))
            except Exception:
                pass
    
    if matches:
        # Sort by size or date (usually files inside a folder are sorted)
        print(f"Total historical matches found: {len(matches)}")
        # Let's copy the largest match to src/main_recovered_vscode.ts
        largest_match = max(matches, key=lambda x: x[1])
        print(f"Largest match is {largest_match[0]} with size {largest_match[1]} chars.")
        import shutil
        shutil.copy(largest_match[0], 'src/main.ts')
        print("Successfully recovered main.ts from VS Code local history!")
    else:
        print("No matches found in VS Code history.")
else:
    print("VS Code History directory does not exist at:", history_dir)
