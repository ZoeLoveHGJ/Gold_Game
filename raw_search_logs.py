import os

brain_dir = r'C:\Users\周洪全\.gemini\antigravity\brain'

for conv in os.listdir(brain_dir):
    log_path = os.path.join(brain_dir, conv, '.system_generated', 'logs', 'overview.txt')
    if not os.path.exists(log_path):
        continue
    
    print(f"Scanning raw log: {conv}")
    with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
    
    print(f"  Length: {len(text)} chars")
    # Search for main.ts occurrences
    idx = 0
    matches = 0
    while True:
        idx = text.find('main.ts', idx)
        if idx == -1:
            break
        matches += 1
        # Print a snippet around it
        start = max(0, idx - 100)
        end = min(len(text), idx + 200)
        print(f"  Match {matches} at index {idx}: {repr(text[start:end])}")
        idx += 7
        if matches >= 5:
            print("  Truncated matching after 5 matches...")
            break
