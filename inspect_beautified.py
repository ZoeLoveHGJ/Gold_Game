import os

js_path = r'e:\Work\Code\Web\Gold\dist\assets\index_beautified.js'

if os.path.exists(js_path):
    with open(js_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    print("Total lines in beautified JS:", len(lines))
    # Let's search for the line containing 'chooseBonusMission' or 'choosePlannedMission'
    for i, line in enumerate(lines):
        if 'next-mission-preview' in line or '选择下一关挑战任务' in line:
            print(f"Match found at line {i}!")
            # Print 100 lines around it
            start = max(0, i - 20)
            end = min(len(lines), i + 100)
            for j in range(start, end):
                print(f"{j}: {lines[j]}", end="")
            break
else:
    print("Beautified JS does not exist!")
