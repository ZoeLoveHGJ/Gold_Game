import os
import json
import re

brain_dir = r'C:\Users\周洪全\.gemini\antigravity\brain'

# We will collect the base main.ts content and all subsequent edits to reconstruct the final file!
base_content = ""
edits = []

for conv in os.listdir(brain_dir):
    log_path = os.path.join(brain_dir, conv, '.system_generated', 'logs', 'overview.txt')
    if not os.path.exists(log_path):
        continue
    
    print(f"Scanning log: {conv}")
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
                
                # Check if it targets main.ts
                target_file = args.get("TargetFile", "")
                if not target_file:
                    target_file = args.get("AbsolutePath", "")
                
                if 'main.ts' in target_file.lower():
                    print(f"  Found main.ts tool call: {name} in {conv} line {idx}")
                    
                    if name == 'write_to_file':
                        code = args.get("CodeContent", "")
                        if len(code) > len(base_content):
                            base_content = code
                            print(f"    Updated base_content! Length: {len(base_content)} chars")
                            
                    elif name in ('replace_file_content', 'multi_replace_file_content'):
                        # Store this edit to apply later
                        edits.append({
                            'conv': conv,
                            'line': idx,
                            'name': name,
                            'args': args,
                            'time': data.get("created_at", "")
                        })

# Sort edits by time to apply them in chronological order
edits.sort(key=lambda x: x['time'])

print(f"Base main.ts size: {len(base_content)} chars. Total edits found: {len(edits)}")

# If we have a base content, let's write it to main.ts
if base_content:
    with open('src/main.ts', 'w', encoding='utf-8') as f:
        f.write(base_content)
    print("Successfully restored the base main.ts file from write_to_file!")
else:
    print("Could not find a base main.ts file from write_to_file in the logs.")
