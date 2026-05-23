import json

path = r'C:\Users\周洪全\.gemini\antigravity\brain\bcabca1c-45c3-4494-af9c-5951af4d39f0\.system_generated\logs\overview.txt'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        if idx == 17:
            try:
                data = json.loads(line)
                tc = data['tool_calls'][0]
                args = tc['args']
                chunks = args.get('ReplacementChunks', '')
                print("Type of chunks:", type(chunks))
                print("Length of chunks:", len(chunks))
                print("Content of chunks:", repr(chunks))
            except Exception as e:
                print("Error:", e)
            break
