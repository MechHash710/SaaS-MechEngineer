import sys
import json

def generate_dispatch(task_id, tasks_filepath="tasks.json"):
    try:
        with open(tasks_filepath, 'r', encoding='utf-8') as f:
            tasks = json.load(f)
    except FileNotFoundError:
        print("Error: tasks.json not found.", file=sys.stderr)
        sys.exit(1)
        
    task = next((t for t in tasks if t['id'] == task_id), None)
    if not task:
        print(f"Error: Task {task_id} not found/loaded.", file=sys.stderr)
        sys.exit(1)
        
    # Determine basic mock agent (In a real scenario, the LLM sets this based on routing rules)
    # The python script serves as a template formatter for the final Dispatch
    
    # We load conflicts or locks (would interface with lock_manager)
    
    dispatch_text = f"""
  ╔══════════════════════════════════════════════════════╗
  ║  DISPATCH — TAREFA {task['id']}
  ║  Agente Primário: [A SER PREENCHIDO PELO ORQUESTRADOR]
  ║  Prioridade/Esforço: [A SER PREENCHIDO]
  ╠══════════════════════════════════════════════════════╣
  ║  OBJETIVO:
  ║  {task.get('name', '')}
  ╠══════════════════════════════════════════════════════╣
  ║  DEPENDÊNCIAS:
  ║  {", ".join(task.get('deps', ['Nenhuma']))}
  ╠══════════════════════════════════════════════════════╣
  ║  ARQUIVOS DE DOMÍNIO BLOQUEADOS:
  ║  [LISTAR ARQUIVOS ADQUIRIDOS NO LOCK MANAGER]
  ╠══════════════════════════════════════════════════════╣
  ║  ALERTAS ATIVOS:
  ║  [LISTAR CONFLITOS DE ARQUIVO OU AVISOS DA MATRIZ]
  ╠══════════════════════════════════════════════════════╣
  ║  INSTRUÇÃO COMPLETA:
  ║  Contexto recebido para a tarefa. Siga as regras de 
  ║  seu Registry Profile fielmente.
  ╚══════════════════════════════════════════════════════╝
"""
    print(dispatch_text)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generate_dispatch.py <task_id>")
        sys.exit(1)
        
    generate_dispatch(sys.argv[1])
