import ast
import os
import json
import sys

def audit_routers(router_dir):
    audit_results = []
    
    # Mapping table
    norm_map = {
        "Fator Solar": "NBR 16401-1 Tabela A.1",
        "Q_env": "NBR 16401-1 §5.2.1",
        "Q_ocp(s)": "ASHRAE Fundamentals 2021, Cap. 18",
        "Q_ocp(l)": "ASHRAE Fundamentals 2021, Cap. 18",
        "V_dia": "NBR 15569 Tabela 1",
        "Q_pessoas": "NBR 16401-3 / ASHRAE 62.1",
    }

    if not os.path.exists(router_dir):
        return [{"error": f"Path {router_dir} not found"}]

    for filename in os.listdir(router_dir):
        if not filename.endswith(".py"):
            continue
            
        filepath = os.path.join(router_dir, filename)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                tree = ast.parse(f.read())
        except Exception as e:
            print(f"Error parsing {filename}: {e}")
            continue
            
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and getattr(node.func, "id", "") == "CalculationStep":
                step_name = ""
                norm_ref = ""
                
                def get_val(n):
                    if isinstance(n, ast.Constant):
                        return str(n.value)
                    if isinstance(n, ast.JoinedStr):
                        return "[F-STRING]"
                    return ""

                # Positional args
                if len(node.args) >= 1:
                    step_name = get_val(node.args[0])
                if len(node.args) >= 6:
                    norm_ref = get_val(node.args[5])
                
                # Keyword args override
                for kw in node.keywords:
                    if kw.arg == "step_name":
                        step_name = get_val(kw.value)
                    if kw.arg == "norm_reference":
                        norm_ref = get_val(kw.value)
                
                if not norm_ref or norm_ref == "":
                    suggestion = "Norma não identificada"
                    for key, val in norm_map.items():
                        if key in step_name:
                            suggestion = val
                            break
                            
                    audit_results.append({
                        "file": filename,
                        "step_name": step_name,
                        "current_norm": norm_ref,
                        "suggestion": suggestion
                    })
                    
    return audit_results

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python audit_norm_coverage.py <router_dir>")
        sys.exit(1)
        
    path = sys.argv[1]
    results = audit_routers(path)
    
    if results and "error" in results[0]:
        print(results[0]["error"])
        sys.exit(1)

    print(f"| {'Arquivo':<20} | {'Step Name':<30} | {'Sugestão de Norma':<30} |")
    print(f"| {'-'*20} | {'-'*30} | {'-'*30} |")
    for res in results:
        print(f"| {res['file']:<20} | {res['step_name']:<30} | {res['suggestion']:<30} |")
        
    with open("audit_report.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\nAudit complete. {len(results)} steps missing norm_reference. Saved to audit_report.json")
