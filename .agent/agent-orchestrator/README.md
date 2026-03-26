# agent-orchestrator — Guia de Uso Rápido

Este guia mostra como acionar a skill em cada modo operacional com exemplos prontos para uso.

---

## Estrutura de Arquivos

```
.agent/agent-orchestrator/
├── SKILL.md                  ← Prompt principal (lido pelo LLM)
├── file_locks.json           ← Estado live dos locks de arquivo
├── references/
│   ├── agent_registry.md     ← Quem faz o quê + domínio de arquivos
│   ├── routing_rules.md      ← Keywords → agente
│   └── conflict_matrix.md    ← Arquivos de alto risco de conflito
└── scripts/
    ├── parse_kanban.py       ← Extrai tasks de .jsx → tasks.json
    ├── build_dep_graph.py    ← Constrói ondas de execução paralela
    ├── lock_manager.py       ← Gerencia file_locks.json
    └── generate_dispatch.py  ← Formata o handoff para o agente
```

---

## Comandos CLI Úteis

### 1. Extrair Kanban para JSON
```bash
python .agent/agent-orchestrator/scripts/parse_kanban.py frontend/src/project8-kanban.jsx
# → Cria scripts/tasks.json
```

### 2. Gerar Plano de Execução (Ondas)
```bash
python .agent/agent-orchestrator/scripts/build_dep_graph.py .agent/agent-orchestrator/scripts/tasks.json
# → Exibe JSON com "waves" (ondas paralelas) e "blocked_by_missing_or_cycle"
```

### 3. Adquirir Lock em Arquivo
```bash
python .agent/agent-orchestrator/scripts/lock_manager.py acquire "routers/simulation.py" "mechanical-engineer" "T25" 4
# → LOCK adquirido; duration em horas
```

### 4. Verificar Conflito Antes de Despachar
```bash
python .agent/agent-orchestrator/scripts/lock_manager.py check "routers/simulation.py,backend_api/main.py"
# → { "has_conflict": true, "conflicts": [...] }
```

### 5. Liberar Locks de uma Task Concluída
```bash
python .agent/agent-orchestrator/scripts/lock_manager.py release "T25"
```

### 6. Ver Todos os Locks Ativos
```bash
python .agent/agent-orchestrator/scripts/lock_manager.py
# → JSON completo do file_locks.json
```

---

## Prompts de Acionamento para o PM

| Intenção                                    | Prompt Exato                                                    | Modo |
| ------------------------------------------- | --------------------------------------------------------------- | ---- |
| Planejar sprint / milestone                 | `"Monte o plano de execução para o milestone M8"`               | 1    |
| Executar tarefa específica                  | `"Execute a tarefa T57"`                                        | 2    |
| Verificar conflitos de arquivo              | `"Tem algum conflito nos arquivos editados agora?"`             | 3    |
| Interpretar pedido em texto livre do PM     | `"O botão de PDF sumiu após a segunda simulação"`               | 4    |
| Gerar status geral do projeto               | `"Gere o status report completo do projeto"`                    | 5    |

---

## Regras de Ouro do Orquestrador

1. **NUNCA** despache uma task com dep não-`Done` sem emitir alerta explícito.
2. **NUNCA** declare duas tasks como paralelas se tocam o mesmo arquivo (ver `conflict_matrix.md`).
3. **SEMPRE** adquira locks **antes** do dispatch e libere **depois** da conclusão.
4. **SEMPRE** confirme com o PM a interpretação antes de despachar (MODO 4).
5. **NUNCA** escreva código de aplicação — você é PM, não developer.

---

## Exemplo de Output Esperado — MODO 1 (Plano de Sprint M8)

```
PLANO DE EXECUÇÃO — MILESTONE M8
════════════════════════════════════════════════

ONDA 1 — Execução Paralela (sem bloqueios)
┌──────┬─────────────────────────────────────┬──────────────────┬──────────┐
│ Task │ Nome                                │ Agente           │ Esforço  │
├──────┼─────────────────────────────────────┼──────────────────┼──────────┤
│ T54  │ Configurar Cloudflare               │ python-backend   │ S (2h)   │
│ T55  │ Preparar deploy cloud-native        │ python-backend   │ M (8h)   │
└──────┴─────────────────────────────────────┴──────────────────┴──────────┘
⚠️ CONFLITO: T54+T55 ambos tocam Dockerfile → execução sequencial recomendada

ONDA 2 — Aguarda ONDA 1 (deps: T54, T55)
┌──────┬─────────────────────────────────────┬──────────────────┬──────────┐
│ T56  │ Abstrair configuração de infra      │ python-backend   │ M (6h)   │
│ T58  │ Deploy frontend Railway/Vercel      │ frontend-spec.   │ S (3h)   │
└──────┴─────────────────────────────────────┴──────────────────┴──────────┘
✅ T56 e T58 paralelos — backend vs frontend, sem sobreposição de arquivo

ONDA 3 — Aguarda ONDA 2 (deps: T56, T57, T58)
│ T57  │ Deploy backend FastAPI Railway      │ python-backend   │ M (4h)   │
```
