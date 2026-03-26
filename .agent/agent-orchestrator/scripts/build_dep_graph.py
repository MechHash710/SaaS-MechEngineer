import sys
import json
import os
from collections import defaultdict, deque

def load_tasks(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def build_graph_and_waves(tasks):
    # Exclude Done tasks from execution waves, but keep them for dependency resolution
    pending_tasks = {t['id']: t for t in tasks if t['status'] != 'Done'}
    done_task_ids = {t['id'] for t in tasks if t['status'] == 'Done'}
    
    # Adjacency list (who depends on whom)
    # in_degree records how many pending tasks a task depends on
    in_degree = defaultdict(int)
    graph = defaultdict(list)
    
    for t_id, t in pending_tasks.items():
        in_degree[t_id] = 0
        for dep in t.get('deps', []):
            if dep in pending_tasks:
                graph[dep].append(t_id)
                in_degree[t_id] += 1
            elif dep not in done_task_ids:
                # Dependency doesn't exist at all, assume unfulfilled
                in_degree[t_id] += 1
                
    waves = []
    queue = deque([t_id for t_id in pending_tasks if in_degree[t_id] == 0])
    
    while queue:
        level_size = len(queue)
        current_wave = []
        for _ in range(level_size):
            u = queue.popleft()
            current_wave.append(pending_tasks[u])
            for v in graph[u]:
                in_degree[v] -= 1
                if in_degree[v] == 0:
                    queue.append(v)
        waves.append(current_wave)
        
    # Check for blocked isolated cycles
    blocked = [t for t_id, t in pending_tasks.items() if in_degree[t_id] > 0]
    
    return {
        "waves": waves,
        "blocked_by_missing_or_cycle": blocked
    }

if __name__ == "__main__":
    tasks_file = sys.argv[1] if len(sys.argv) > 1 else "tasks.json"
    if not os.path.exists(tasks_file):
        print(f"Error: Could not find {tasks_file}", file=sys.stderr)
        sys.exit(1)
        
    tasks = load_tasks(tasks_file)
    result = build_graph_and_waves(tasks)
    
    output_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(output_dir, "execution_plan.json"), "w", encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
        
    print(json.dumps(result, indent=2, ensure_ascii=False))
