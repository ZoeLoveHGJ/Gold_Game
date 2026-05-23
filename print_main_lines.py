with open('src/main.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx in range(10, 50):
    if idx < len(lines):
        print(f"{idx+1}: {lines[idx]}", end="")
