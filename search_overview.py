import os

brain_dir = r'C:\Users\周洪全\.gemini\antigravity\brain'

for conv in os.listdir(brain_dir):
    log_path = os.path.join(brain_dir, conv, '.system_generated', 'logs', 'overview.txt')
    if not os.path.exists(log_path):
        continue
    
    with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
        
    print(f"Scanning log {conv}...")
    if 'checkGlobalCollisions' in text:
        print(f"  FOUND checkGlobalCollisions in log {conv}!")
    if 'missionPenaltyStrength' in text:
        print(f"  FOUND missionPenaltyStrength in log {conv}!")
    if 'chooseBonusMission' in text:
        print(f"  FOUND chooseBonusMission in log {conv}!")
