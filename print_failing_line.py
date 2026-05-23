import json

path = r'C:\Users\周洪全\.gemini\antigravity\brain\bcabca1c-45c3-4494-af9c-5951af4d39f0\.system_generated\logs\overview.txt'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        if idx == 31:
            data = json.loads(line)
            tool_calls = data.get("tool_calls", [])
            for tc in tool_calls:
                name = tc.get("name", "")
                if name == 'multi_replace_file_content':
                    args = tc.get("args", {})
                    chunks = args.get('ReplacementChunks', '')
                    print("chunks length:", len(chunks))
                    print("First 200 chars:")
                    print(repr(chunks[:200]))
                    # Let's print exactly character 58 and around it
                    print("Char 50 to 70:", repr(chunks[50:70]))
            break
