import os
import json
import re

path = r'C:\Users\周洪全\.gemini\antigravity\brain\fb51a09c-96dd-4b05-b350-fc0d9d838449\.system_generated\logs\overview.txt'

with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        try:
            data = json.loads(line)
            content = data.get("content", "")
            if not content:
                continue
            
            content_lines = content.split('\n')
            for c_idx, cl in enumerate(content_lines):
                if re.match(r'^\s*100:\s', cl):
                    print(f"Line {idx}, content line {c_idx} starts with '100:'!")
                    # Print 10 lines before
                    start = max(0, c_idx - 15)
                    end = c_idx + 5
                    for k in range(start, end):
                        print(f"  [{k}]: {repr(content_lines[k])}")
                    print("-" * 50)
        except Exception as e:
            pass
