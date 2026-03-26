import argparse
import re
import os
import json
from pathlib import Path

def extract_component_elements(file_path):
    """Extrai inputs e botões de um arquivo de componente React (TSX/JSX)."""
    elements = {"inputs": [], "buttons": []}
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

        # Encontra <input name="alguma_coisa"...>
        inputs = re.findall(r'<input[^>]*name=["\']([^"\']+)["\']', content)
        for i in inputs:
            elements["inputs"].append(i)
            
        # Tenta achar textos de botões: <button>Texto</button>
        buttons = re.findall(r'<button[^>]*>([^<]+)</button>', content)
        for b in buttons:
            elements["buttons"].append(b.strip())
            
    return elements

def extract_spec_elements(file_path):
    """Extrai locators de um arquivo especificação de teste Playwright (.spec.ts)."""
    elements = {"inputs": [], "buttons": []}
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

        # getByLabel('Alguma coisa') ou getByPlaceholder
        inputs = re.findall(r'getByLabel\([\'"]([^\'"]+)[\'"]\)', content)
        inputs += re.findall(r'getByPlaceholder\([\'"]([^\'"]+)[\'"]\)', content)
        for i in inputs:
            elements["inputs"].append(i)
            
        # getByRole('button', { name: /Text/i })
        buttons = re.findall(r'getByRole\([\'"]button[\'"],\s*\{\s*name:\s*[/[\'"](.*?)[/\'"]', content)
        for b in buttons:
            elements["buttons"].append(b.strip())
            
    return elements

def analyze_coverage(comp_content, spec_content):
    total_elements = len(comp_content["inputs"]) + len(comp_content["buttons"])
    if total_elements == 0:
        return {"score": 100, "status": "ADEQUADO", "missing": [], "covered": []}
        
    covered = []
    missing = []
    
    for ipt in comp_content["inputs"]:
        # Aproximação simples: se o nome do input aparece DE ALGUMA FORMA nas labels dos specs
        if any(ipt.lower() in s.lower() for s in spec_content["inputs"]):
            covered.append(f"Input: {ipt}")
        else:
            missing.append(f"Input: {ipt}")
            
    for btn in comp_content["buttons"]:
        if any(btn.lower() in s.lower() for s in spec_content["buttons"]):
            covered.append(f"Button: {btn}")
        else:
            missing.append(f"Button: {btn}")
            
    score = (len(covered) / total_elements) * 100
    
    status = "ADEQUADO"
    if score < 40:
        status = "CRÍTICO"
    elif score < 70:
        status = "ATENÇÃO"
        
    return {
        "score": round(score, 2),
        "status": status,
        "missing": missing,
        "covered": covered,
        "total": total_elements
    }

def main():
    parser = argparse.ArgumentParser(description="Auditoria de Cobertura E2E (QA Tester)")
    parser.add_argument("--comp", help="Caminho para o arquivo do componente React (.tsx)")
    parser.add_argument("--spec", help="Caminho para o arquivo de teste Playwright (.spec.ts)")
    
    args = parser.parse_args()
    
    if not args.comp or not args.spec:
        print("Erro: Forneça --comp e --spec caminhos válidos.")
        return

    comp_elements = extract_component_elements(args.comp)
    spec_elements = extract_spec_elements(args.spec)
    
    report = analyze_coverage(comp_elements, spec_elements)
    
    print("============================================================")
    print(f"RELATÓRIO DE COBERTURA: {Path(args.comp).name} vs {Path(args.spec).name}")
    print("============================================================")
    
    print(f"Score: {report['score']}% — {report['status']}")
    print(f"Total de elementos interativos no componente: {report['total']}")
    print(f"Cobertos: {len(report['covered'])} | Faltantes: {len(report['missing'])}\n")
    
    print("⚠️  Elementos Mapeados FALTANDO nos testes:")
    if not report['missing']:
        print("   Nenhum! Cobertura 100%.")
    for m in report['missing']:
        print(f"   [ ] {m}")
        
    print("\n✅ Elementos Encontrados:")
    for c in report['covered']:
        print(f"   [x] {c}")

if __name__ == "__main__":
    main()
