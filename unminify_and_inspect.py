import os

js_path = r'e:\Work\Code\Web\Gold\dist\assets\index-C-lLk4Rm.js'

if os.path.exists(js_path):
    with open(js_path, 'r', encoding='utf-8') as f:
        code = f.read()
    
    print("JS File Size:", len(code), "bytes")
    # Let's search for some function names from our main.ts, e.g., 'chooseBonusMission' or 'awardCleanSweepIfNeeded'
    for kw in ['chooseBonusMission', 'awardCleanSweepIfNeeded', 'drawScoreNoticeOverlay', 'floatingTexts']:
        idx = code.find(kw)
        if idx != -1:
            print(f"Keyword '{kw}' found at index {idx}!")
            # Print a 400 character snippet around it
            start = max(0, idx - 100)
            end = min(len(code), idx + 1000)
            print("--- SNIPPET ---")
            print(code[start:end])
            print("---------------\n")
        else:
            print(f"Keyword '{kw}' not found!")
else:
    print("JS file does not exist!")
