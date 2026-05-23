import os

js_path = r'e:\Work\Code\Web\Gold\dist\assets\index_beautified.js'

if os.path.exists(js_path):
    with open(js_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    print("Scanning index_beautified.js...")
    # Find functions declared in the global scope
    global_funcs = []
    current_class = None
    class_indent = 0
    
    for i, line in enumerate(lines):
        # Detect class start
        if 'class ' in line:
            current_class = line.strip()
            class_indent = line.count(' ')
            print(f"Class detected at line {i}: {current_class}")
        elif current_class and line.count(' ') <= class_indent and '}' in line:
            # Detect class end
            print(f"Class ended at line {i}")
            current_class = None
            
        if not current_class:
            if 'function ' in line:
                global_funcs.append((i, line.strip()))
                
    print(f"\nFound {len(global_funcs)} global functions:")
    for idx, f_name in global_funcs:
        print(f"  Line {idx}: {f_name}")
else:
    print("Beautified JS does not exist!")
