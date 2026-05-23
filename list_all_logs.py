import os

brain_dir = r'C:\Users\周洪全\.gemini\antigravity\brain'
for conv in os.listdir(brain_dir):
    log_path = os.path.join(brain_dir, conv, '.system_generated', 'logs', 'overview.txt')
    if os.path.exists(log_path):
        print(f"Conversation: {conv}, Log Size: {os.path.getsize(log_path)} bytes")
    else:
        # Check if the folder has any logs at all
        conv_dir = os.path.join(brain_dir, conv)
        if os.path.isdir(conv_dir):
            print(f"Conversation folder: {conv} exists, but no log file")
