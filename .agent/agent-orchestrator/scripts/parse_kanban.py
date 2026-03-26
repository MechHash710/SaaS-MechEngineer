import sys
import re
import json
import os

def extract_project_data(jsx_path):
    if not os.path.exists(jsx_path):
        print(f"Error: Could not find {jsx_path}", file=sys.stderr)
        return None

    with open(jsx_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Tenta usar regex para capturar a const PROJECT_DATA
    match = re.search(r'const\s+PROJECT_DATA\s*=\s*({[\s\S]*?});\n', content)
    if not match:
        print("Error: Could not find PROJECT_DATA export in JSX.", file=sys.stderr)
        return None
        
    js_object_str = match.group(1)
    
    # Simple converter from JS object to robust JSON
    js_object_str = re.sub(r'//.*', '', js_object_str) # strip single-line comments
    js_object_str = re.sub(r'([{,]\s*)([a-zA-Z0-9_]+)\s*:', r'\1"\2":', js_object_str) # Add quotes to unquoted keys
    
    try:
        data = json.loads(js_object_str)
        return data
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON representation: {e}", file=sys.stderr)
        # Fallback to basic regex scraping for tasks specifically
        tasks = []
        task_blocks = re.findall(r'id:\s*["\'](T\d+)["\'][\s\S]*?milestone:\s*["\'](.*?)["\'][\s\S]*?status:\s*["\'](.*?)["\'][\s\S]*?name:\s*["\'](.*?)["\']', js_object_str)
        
        # very simplified fallback extraction
        for block in task_blocks:
            deps_match = re.search(rf'id:\s*["\']{block[0]}["\'][\s\S]*?deps:\s*\[([^\]]*)\]', js_object_str)
            deps = []
            if deps_match:
                deps_raw = deps_match.group(1)
                deps = [d.strip().strip("'\"") for d in deps_raw.split(',') if d.strip()]
                
            tasks.append({
                "id": block[0],
                "milestone": block[1],
                "status": block[2],
                "name": block[3],
                "deps": [d for d in deps if d]
            })
            
        return {"tasks": tasks}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python parse_kanban.py <path_to_jsx>")
        sys.exit(1)
        
    data = extract_project_data(sys.argv[1])
    if data:
        # Save to tasks.json locally to the directory executing it
        output_dir = os.path.dirname(os.path.abspath(__file__))
        with open(os.path.join(output_dir, "tasks.json"), "w", encoding='utf-8') as f:
            json.dump(data.get("tasks", []), f, indent=2, ensure_ascii=False)
        print("Successfully exported tasks.json")
