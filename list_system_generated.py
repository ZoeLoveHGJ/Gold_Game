import os

sys_dir = r'C:\Users\周洪全\.gemini\antigravity\brain\fb51a09c-96dd-4b05-b350-fc0d9d838449\.system_generated'

if os.path.exists(sys_dir):
    print("Files in .system_generated:")
    for root, dirs, files in os.walk(sys_dir):
        for file in files:
            print(os.path.join(root, file))
else:
    print(".system_generated does not exist!")
