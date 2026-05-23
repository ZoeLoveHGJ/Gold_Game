import os
import json

brain_dir = r'C:\Users\周洪全\.gemini\antigravity\brain'

for conv in os.listdir(brain_dir):
    log_path = os.path.join(brain_dir, conv, '.system_generated', 'logs', 'overview.txt')
    if not os.path.exists(log_path):
        continue
    
    with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
        for idx, line in enumerate(f):
            try:
                data = json.loads(line)
            except Exception:
                continue
            
            tool_calls = data.get("tool_calls", [])
            for tc in tool_calls:
                name = tc.get("name", "")
                if name == 'multi_replace_file_content':
                    args = tc.get("args", {})
                    chunks = args.get("ReplacementChunks", "")
                    if isinstance(chunks, str) and chunks:
                        # Let's escape using unicode_escape
                        # But wait, unicode_escape converts double quotes to \"? No, but it converts backslashes!
                        # Let's see: to escape only the actual control characters (newlines, carriage returns, tabs):
                        chunks_escaped = chunks.replace('\\', '\\\\').replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')
                        try:
                            parsed = json.loads(chunks_escaped)
                            print(f"Log: {conv}, line {idx} - SUCCESS with custom escape!")
                        except Exception as e:
                            # Let's try raw json.dumps of the string to see if we can do something else?
                            # Wait, if we just do:
                            try:
                                # What if we replace single quotes or other issues?
                                # Let's print the exception to see what's wrong with chunks_escaped
                                print(f"Log: {conv}, line {idx} - FAILED with custom escape: {e}")
                            except:
                                pass
                            
            # Let's break early to not flood
            # break
