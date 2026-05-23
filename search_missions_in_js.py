import os

js_path = r'e:\Work\Code\Web\Gold\dist\assets\index-C-lLk4Rm.js'

if os.path.exists(js_path):
    with open(js_path, 'r', encoding='utf-8') as f:
        code = f.read()
    
    # Search for all occurrences of "mission" or "task" case-insensitively
    import re
    matches = [m.start() for m in re.finditer(r'mission|task', code, re.IGNORECASE)]
    print("Found matches:", len(matches))
    for m in matches[:10]:
        print(f"Match at {m}: {repr(code[max(0, m-50):min(len(code), m+150)])}")
else:
    print("JS file does not exist!")
