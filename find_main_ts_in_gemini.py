import os

base_dir = r'C:\Users\周洪全\.gemini\antigravity'
for root, dirs, files in os.walk(base_dir):
    for f in files:
        if 'main' in f.lower() or 'recovered' in f.lower():
            fp = os.path.join(root, f)
            try:
                sz = os.path.getsize(fp)
                if sz > 10000: # larger than 10KB
                    print(f"Found match: {fp}, Size: {sz} bytes")
            except:
                pass
