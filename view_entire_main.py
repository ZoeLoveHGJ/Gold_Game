with open('src/main.ts', 'r', encoding='utf-8') as f:
    content = f.read()

print("src/main.ts size:", len(content), "chars")
print("src/main.ts line count:", len(content.split('\n')))
print("First 300 chars:")
print(content[:300])
print("\nLast 300 chars:")
print(content[-300:])
