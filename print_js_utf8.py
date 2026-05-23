import os

js_path = r'e:\Work\Code\Web\Gold\dist\assets\index-B51nOtR9.js'
with open(js_path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Let's search for "BOOM" or "x" or "PK" or "称号" to see if the emojis are decoded perfectly
import re
for m in re.finditer(r'[\u4e00-\u9fa5]|BOOM|CHAIN|QUICKSAND|lucky|quicksand', text):
    start = max(0, m.start() - 20)
    end = min(len(text), m.start() + 40)
    print(f"Match: {repr(text[start:end])}")
