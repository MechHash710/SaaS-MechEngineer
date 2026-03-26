import json
import os
import sys
from datetime import datetime, timezone

LOCK_FILE = os.path.join(os.path.dirname(__file__), "..", "file_locks.json")

def load_locks():
    if not os.path.exists(LOCK_FILE):
        return {"locks": [], "last_updated": datetime.now(timezone.utc).isoformat()}
    try:
        with open(LOCK_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return {"locks": [], "last_updated": datetime.now(timezone.utc).isoformat()}

def save_locks(data):
    data["last_updated"] = datetime.now(timezone.utc).isoformat()
    with open(LOCK_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def acquire(file_path, agent, task_id, duration_h=1):
    data = load_locks()
    
    # Check if already locked
    for l in data["locks"]:
        if l["file"] == file_path and l["task_id"] != task_id:
            print(f"FAILED: File {file_path} is already locked by {l['agent']} ({l['task_id']})")
            return False
            
    # Clean old self locks for this file
    data["locks"] = [l for l in data["locks"] if not (l["file"] == file_path and l["task_id"] == task_id)]
    
    data["locks"].append({
        "file": file_path,
        "agent": agent,
        "task_id": task_id,
        "locked_at": datetime.now(timezone.utc).isoformat(),
        "expected_duration_h": duration_h
    })
    save_locks(data)
    print(f"SUCCESS: Lock acquired on {file_path} for {agent} ({task_id})")
    return True

def release(task_id):
    data = load_locks()
    initial_len = len(data["locks"])
    data["locks"] = [l for l in data["locks"] if l["task_id"] != task_id]
    save_locks(data)
    print(f"Released {initial_len - len(data['locks'])} locks for task {task_id}")

def check(file_list_str):
    files = [f.strip() for f in file_list_str.split(",") if f.strip()]
    data = load_locks()
    
    conflicts = []
    for l in data["locks"]:
        for f in files:
            # simple substring match for folders or exact file match
            if l["file"] == f or f.startswith(l["file"].replace('*', '')):
                conflicts.append(l)
    
    if conflicts:
        print(json.dumps({"has_conflict": True, "conflicts": conflicts}, indent=2))
    else:
        print(json.dumps({"has_conflict": False, "conflicts": []}, indent=2))
        
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps(load_locks(), indent=2))
        sys.exit(0)
        
    cmd = sys.argv[1]
    if cmd == "acquire" and len(sys.argv) >= 5:
        acquire(sys.argv[2], sys.argv[3], sys.argv[4], float(sys.argv[5]) if len(sys.argv) > 5 else 1.0)
    elif cmd == "release" and len(sys.argv) >= 3:
        release(sys.argv[2])
    elif cmd == "check" and len(sys.argv) >= 3:
        check(sys.argv[2])
    else:
        print("Invalid command")
