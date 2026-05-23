with open(r'C:\Users\周洪全\.gemini\antigravity\brain\fb51a09c-96dd-4b05-b350-fc0d9d838449\.system_generated\logs\overview.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

idx = text.find('chooseBonusMission')
if idx != -1:
    print("FOUND at index:", idx)
    print("--- Surrounding Text ---")
    print(text[max(0, idx - 1000):min(len(text), idx + 2000)])
else:
    print("NOT FOUND")
