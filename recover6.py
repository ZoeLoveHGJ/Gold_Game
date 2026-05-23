import json
import re

log_paths = [
    r'C:\Users\周洪全\.gemini\antigravity\brain\bcabca1c-45c3-4494-af9c-5951af4d39f0\.system_generated\logs\overview.txt',
    r'C:\Users\周洪全\.gemini\antigravity\brain\0dce3c38-c054-4196-be06-1ca59fc025dd\.system_generated\logs\overview.txt'
]

best_content = ""
for log_path in log_paths:
    try:
        with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()
        blocks = text.split('\n')
        for block in blocks:
            if not block.strip(): continue
            if not block.startswith('{'): continue
            try:
                data = json.loads(block)
                if 'content' in data:
                    content = data['content']
                    if 'main.ts' in content.lower() and 'The following code has been modified' in content:
                        if len(content) > len(best_content):
                            best_content = content
            except:
                pass
    except Exception as e:
        print("Error reading log:", e)

if best_content:
    lines = best_content.split('\n')
    recovered = []
    for line in lines:
        match = re.match(r'^(\d+): (.*)', line)
        if match:
            recovered.append((int(match.group(1)), match.group(2)))
    
    if recovered:
        recovered.sort(key=lambda x: x[0])
        with open('src/main_recovered.ts', 'w', encoding='utf-8') as f:
            for n, l in recovered:
                f.write(l + '\n')
        print(f"Recovered {len(recovered)} lines from best content length {len(best_content)}!")
    else:
        print("Failed to parse lines from content.")
else:
    print("Could not find content in JSON.")
