# 🤝 Contributing Guide

## Antes de Contribuir

1. Leia o [Architecture Overview](./architecture.md)
2. Verifique as issues abertas no GitHub
3. Para novas features, abra uma issue primeiro para discussão

---

## Padrões de Código

### Backend (Python)

- **Formatter:** `ruff format` — PEP 8 + isort automático
- **Linter:** `ruff check`
- **Type hints:** Use anotações de tipo em todas as funções públicas
- **Docstrings:** Funções públicas devem ter docstring descritiva
- Novas calculadoras DEVEM herdar de `BaseCalculator`
- Constantes com referência normativa: sempre documente a norma

```python
# ✅ Correto
CARGA_SENSIVEL_PESSOA_BTU = 600.0
# Referência: ASHRAE Fundamentals 2021, Tabela 1, Capítulo 18

# ❌ Incorreto — sem fonte normativa
CARGA_SENSIVEL = 600.0
```

### Frontend (TypeScript/React)

- **Formatter:** Prettier (configurado em `.prettierrc`)
- **Linter:** ESLint (`npm run lint`)
- Componentes novos vão em `frontend/src/components/`
- Páginas vão em `frontend/src/pages/`
- Usar os componentes do Design System (`Button`, `Modal`, `Toast`, etc.)

---

## Adicionando um Novo Simulador

1. **Backend:** Crie `backend_api/routers/seu_simulador.py` herdando `BaseCalculator`
2. **Registre o router** em `main.py`
3. **Frontend Form:** Crie `frontend/src/components/SeuSimuladorForm.tsx`
4. **Frontend Results:** Crie `frontend/src/components/SeuSimuladorResults.tsx`
5. **Adicione a tab** no Module Switcher em `App.tsx`
6. **Testes unitários:** Crie `backend_api/tests/test_seu_simulador.py`
7. **Docs:** Documente o endpoint em `docs/api/simulators.md`

---

## Fluxo de Pull Request

1. Fork + Branch a partir de `main` (ex: `feat/simulador-geotermico`)
2. Implemente as mudanças seguindo os padrões
3. Execute os tests: `pytest` (backend) + `npm run test:e2e` (frontend)
4. Execute linters: `ruff check .` + `npm run lint`
5. Abra o PR preenchendo o template em `.github/PULL_REQUEST_TEMPLATE.md`
6. Aguarde revisão — CI GitHub Actions rodará lint + testes automaticamente

---

## Testes

- Testes unitários do backend ficam em `backend_api/tests/`
- Testes E2E ficam em `frontend/e2e/`
- Para novos endpoints, inclua testes de:
  - Caso típico (inputs válidos)
  - Inputs inválidos (esperado erro 422)
  - Limites extremos (warnings/critical)
