import os
import json

brain_dir = r'C:\Users\周洪全\.gemini\antigravity\brain'

for conv in os.listdir(brain_dir):
    log_path = os.path.join(brain_dir, conv, '.system_generated', 'logs', 'overview.txt')
    if not os.path.exists(log_path):
        continue
    
    with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
        for idx, line in enumerate(f):
            try:
                data = json.loads(line)
                content = data.get("content", "")
                if 'write_to_file' in content and 'main.ts' in content:
                    print(f"Log: {conv}, Line {idx} contains write_to_file for main.ts!")
                    # Check size of content
                    print("  Length of content:", len(content))
                    # Let's write a small sample of content to see if it contains the file code
                    if len(content) > 10000:
                        print("  LARGE CONTENT FOUND!")
            except:
                pass
