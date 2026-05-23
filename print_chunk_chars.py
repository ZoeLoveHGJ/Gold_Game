import os
import json

path = r'C:\Users\周洪全\.gemini\antigravity\brain\bcabca1c-45c3-4494-af9c-5951af4d39f0\.system_generated\logs\overview.txt'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        if idx == 27:
            data = json.loads(line)
            tool_calls = data.get("tool_calls", [])
            for tc in tool_calls:
                name = tc.get("name", "")
                if name == 'multi_replace_file_content':
                    args = tc.get("args", {})
                    chunks = args.get('ReplacementChunks', '')
                    print("FOUND chunks on line 27!")
                    print("chunks length:", len(chunks))
                    print("Snippet around char 58:")
                    print("RAW:")
                    print(repr(chunks[45:85]))
                    print("First 150 chars of chunks:")
                    print(repr(chunks[:150]))
                    break
            break
