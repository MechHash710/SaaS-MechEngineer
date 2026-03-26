# Matriz de Conflitos (Conflict Matrix)

Sempre que a `task` tocar nestes arquivos, há risco de choque. Consulte esta matriz antes de autorizar paralelismo.

| Arquivo de Risco Alto                     | Agentes Comuns Envolvidos                            | Recomendação de Solução do Orquestrador                                 |
| ----------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------- |
| `routers/simulation.py`                 | `mechanical-engineer` + `python-backend`           | **SEQUENCIAL.** Engenheiro define a matemática, Backend plumba as rotas.|
| `routers/solar_heating.py`              | `mechanical-engineer` + `python-backend`           | **SEQUENCIAL.** Evita que endpoints quebrem fórmulas parciais.          |
| `templates/base.html`                   | `engineering-design-agent` + `python-backend`      | **PARALELO PARCIAL.** Backend não deve tocar no CSS de template.        |
| `frontend/src/App.tsx`                  | `frontend-specialist` + `software-qa-tester`       | **SEQUENCIAL.** QA deve bloquear até Frontend Specialist terminar o DOM.|
| `backend_api/main.py`                   | `python-backend` + `software-qa-tester`            | **PARALELO PERMITIDO.** Mas requer reload do uvicorn após edição do Backend. |
| `.github/workflows/*.yml`               | `python-backend` + `software-qa-tester`            | **SEQUENCIAL.** Modificações CI/CD devem ser atômicas.                  |
| `frontend/e2e/simulation.spec.ts`       | `software-qa-tester` + `frontend-specialist`       | **SEQUENCIAL.** QA escreve teste, Front conserta os bugs achados.       |
| `schemas/*.ts` (frontend)               | `frontend-specialist` + `mechanical-engineer`      | **SEQUENCIAL.** Se modelo de I/O muda matematicamente, front precisa atualizar tipos Zod.|
