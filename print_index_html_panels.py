with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines[:150]):
    print(f"{i+1}: {line}", end="")
