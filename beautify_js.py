import os

js_path = r'e:\Work\Code\Web\Gold\dist\assets\index-C-lLk4Rm.js'
out_path = r'e:\Work\Code\Web\Gold\dist\assets\index_beautified.js'

if os.path.exists(js_path):
    with open(js_path, 'r', encoding='utf-8') as f:
        code = f.read()
    
    # Simple formatting: add newlines after ;, {, }, and split by commas in some declarations
    formatted = []
    indent = 0
    i = 0
    while i < len(code):
        char = code[i]
        if char == '{':
            indent += 2
            formatted.append('{\n' + ' ' * indent)
        elif char == '}':
            indent = max(0, indent - 2)
            formatted.append('\n' + ' ' * indent + '}\n' + ' ' * indent)
        elif char == ';':
            formatted.append(';\n' + ' ' * indent)
        else:
            formatted.append(char)
        i += 1
        
    beautified = "".join(formatted)
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(beautified)
    print("JS Beautification complete! Written to dist/assets/index_beautified.js")
    print("Size of beautified file:", len(beautified), "bytes")
else:
    print("JS file does not exist!")
