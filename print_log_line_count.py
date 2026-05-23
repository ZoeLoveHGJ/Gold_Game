path = r'C:\Users\周洪全\.gemini\antigravity\brain\fb51a09c-96dd-4b05-b350-fc0d9d838449\.system_generated\logs\overview.txt'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

print("Total lines in overview.txt:", len(lines))
if lines:
    print("First line:", repr(lines[0][:150]))
    print("Last line:", repr(lines[-1][:150]))
