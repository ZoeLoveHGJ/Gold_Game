import os
import re
import json

brain_dir = r'C:\Users\周洪全\.gemini\antigravity\brain'
main_ts_lines = {}

# List all folders in brain_dir
for conv in os.listdir(brain_dir):
    log_path = os.path.join(brain_dir, conv, '.system_generated', 'logs', 'overview.txt')
    if not os.path.exists(log_path):
        continue
    
    print(f"Parsing log: {conv}")
    with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
        for line_idx, line in enumerate(f):
            try:
                data = json.loads(line)
            except Exception:
                continue
            
            content = data.get("content", "")
            if not content:
                continue
            
            # Split the content string into lines
            content_lines = content.split('\n')
            is_main_ts = False
            
            for cl in content_lines:
                # Detect start of a main.ts block
                # Can be file:///.../main.ts, or AbsolutePath: .../main.ts
                if re.search(r'(file:///|AbsolutePath|TargetFile).*main\.ts', cl, re.IGNORECASE):
                    is_main_ts = True
                    continue
                # Detect start of another file block, which ends main.ts block
                elif re.search(r'(file:///|AbsolutePath|TargetFile).*\.(css|html|js|json)', cl, re.IGNORECASE):
                    is_main_ts = False
                    continue
                
                # If we are in a main.ts block, extract line numbers
                if is_main_ts:
                    match = re.match(r'^\s*(\d+):\s(.*)', cl)
                    if match:
                        line_num = int(match.group(1))
                        val = match.group(2)
                        
                        # Store/update the line content
                        # We prefer non-empty and longer lines if there's any variation
                        if line_num not in main_ts_lines or len(val) > len(main_ts_lines[line_num]):
                            main_ts_lines[line_num] = val

if main_ts_lines:
    max_line = max(main_ts_lines.keys())
    print(f"Reconstructed main.ts with {len(main_ts_lines)} unique lines out of {max_line} total lines.")
    
    # Fill in missing lines with a placeholder or empty comment if any are missing
    with open('src/main.ts', 'w', encoding='utf-8') as f:
        for i in range(1, max_line + 1):
            line_val = main_ts_lines.get(i, f"// Line {i} was missing in logs")
            f.write(line_val + '\n')
            
    print("Successfully restored src/main.ts!")
else:
    print("No main.ts lines could be reconstructed from any conversation logs.")
