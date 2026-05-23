import os
import json
import re

brain_dir = r'C:\Users\周洪全\.gemini\antigravity\brain'

import subprocess
print("Checking out a clean main.ts from git...")
subprocess.run(['git', 'checkout', 'HEAD', '--', 'src/main.ts'], cwd='e:\\Work\\Code\\Web\\Gold')

with open('src/main.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Normalize line endings
content = content.replace('\r\n', '\n')

# Collect all edits chronologically
edits = []

for conv in sorted(os.listdir(brain_dir)):
    log_path = os.path.join(brain_dir, conv, '.system_generated', 'logs', 'overview.txt')
    if not os.path.exists(log_path):
        continue
    
    with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
        for idx, line in enumerate(f):
            try:
                data = json.loads(line)
            except Exception:
                continue
            
            tool_calls = data.get("tool_calls", [])
            if not tool_calls:
                continue
            
            for tc in tool_calls:
                name = tc.get("name", "")
                args = tc.get("args", {})
                if not args:
                    continue
                
                target_file = args.get("TargetFile", "") or args.get("AbsolutePath", "")
                if 'main.ts' in target_file.lower():
                    if name in ('replace_file_content', 'multi_replace_file_content'):
                        edits.append({
                            'conv': conv,
                            'line': idx,
                            'name': name,
                            'args': args,
                            'time': data.get("created_at", "")
                        })

# Sort edits by time
edits.sort(key=lambda x: x['time'])

print(f"Total edits to apply: {len(edits)}")

successful_replacements = 0
failed_replacements = 0

for i, edit in enumerate(edits):
    name = edit['name']
    args = edit['args']
    conv = edit['conv']
    line = edit['line']
    
    # Standardize line endings of args
    if name == 'replace_file_content':
        target = args.get("TargetContent", "").replace('\r\n', '\n')
        replacement = args.get("ReplacementContent", "").replace('\r\n', '\n')
        
        if target in content:
            content = content.replace(target, replacement)
            successful_replacements += 1
        else:
            # Try a fuzzy match without leading/trailing whitespace if needed
            target_strip = target.strip()
            if target_strip and target_strip in content:
                content = content.replace(target_strip, replacement.strip())
                successful_replacements += 1
            else:
                print(f"[{i}] Failed replace_file_content in {conv} line {line}")
                failed_replacements += 1
                
    elif name == 'multi_replace_file_content':
        chunks = args.get("ReplacementChunks", [])
        print(f"[{i}] multi_replace_file_content chunks type: {type(chunks)}, length: {len(chunks)}")
        if chunks and len(chunks) > 0:
            print("  First chunk type:", type(chunks[0]))
            print("  First chunk sample:", repr(str(chunks[0])[:150]))
            
        if isinstance(chunks, str):
            try:
                chunks = json.loads(chunks)
            except:
                pass
        
        # If chunks is a list, check if its elements are strings (which would need JSON loading!)
        if isinstance(chunks, list) and len(chunks) > 0 and isinstance(chunks[0], str):
            try:
                # Try parsing each element as JSON if they are JSON strings
                new_chunks = []
                for ch in chunks:
                    if isinstance(ch, str):
                        new_chunks.append(json.loads(ch))
                    else:
                        new_chunks.append(ch)
                chunks = new_chunks
                print("  Successfully parsed nested chunk strings!")
            except Exception as ex:
                print("  Failed to parse nested chunk strings:", ex)
                
        for chunk_idx, chunk in enumerate(chunks):
            if isinstance(chunk, str):
                try:
                    chunk = json.loads(chunk)
                except Exception as ex:
                    print(f"  Failed parsing chunk {chunk_idx}:", ex)
                    continue
            
            target = chunk.get("TargetContent", "").replace('\r\n', '\n')
            replacement = chunk.get("ReplacementContent", "").replace('\r\n', '\n')
            
            if target in content:
                content = content.replace(target, replacement)
                successful_replacements += 1
            else:
                target_strip = target.strip()
                if target_strip and target_strip in content:
                    content = content.replace(target_strip, replacement.strip())
                    successful_replacements += 1
                else:
                    print(f"  Chunk {chunk_idx} failed in {conv} line {line}!")
                    failed_replacements += 1

print(f"Applying complete. Successful replacements: {successful_replacements}, Failed: {failed_replacements}")

# Write the final reconstructed content to main.ts
with open('src/main.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Reconstructed main.ts size: {len(content)} chars.")
