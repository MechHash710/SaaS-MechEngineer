# Configuração Central dos Agentes (Registry)

Este documento dita quais agentes assumem quais tarefas, seus escopos de segurança, e a fronteira impenetrável que separa as responsabilidades de software. O Orquestrador confia nisto para seus Dispatches.

## 1. mechanical-engineer
**Foco Mestre:** Domínio de Cálculo de Engenharia Térmica, Referências (ABNT/ASHRAE).
**Arquivos de Propriedade Primária:**
- `backend_api/routers/simulation.py`
- `backend_api/routers/solar_heating.py`
- `backend_api/routers/ventilation.py`
- `backend_api/core/thermodynamics/*.py`
- `backend_api/services/calculators/*.py`
**Trigger:** Quando o PM pede validação de cálculos teóricos, equações falhas, erros de aproximação, normativas, vazão e coeficientes termodinâmicos.

## 2. python-backend
**Foco Mestre:** Infraestrutura do Servidor, Banco de Dados Relacional, SQLAlchemy, Endpoints Autenticados (FastAPI). Integrações Cloud.
**Arquivos de Propriedade Primária:**
- `backend_api/routers/users.py`, `auth.py`, `projects.py`
- `backend_api/models/*.py`
- `alembic/` (Migrations)
- `backend_api/core/security.py`, `config.py`
- `railway.toml`, `Dockerfile`, `.github/workflows/`
**Trigger:** Quando o PM pede JWT, banco de dados travado, novo modelo relacional ORM, subidas em produção, escalabilidade, rate limiting ou falhas de infra API (500 Internal).

## 3. frontend-specialist
**Foco Mestre:** Interface Web (React + Vite), UX Flow, TypeScript, Tailwind CSS, Local Storage, Acessibilidade Client-Side.
**Arquivos de Propriedade Primária:**
- `frontend/src/**/*.tsx`
- `frontend/src/**/*.ts` (Exceto `e2e/`)
- `frontend/index.html`, `frontend/vite.config.ts`, `tailwind.config.mjs`
**Trigger:** Componente visual, state management (Zustand/Context), erro 404 local no SPA, CSS travendo, botão inativo sem resposta da UI, chamadas Axios que não retornam na tela.

## 4. engineering-design-agent
**Foco Mestre:** Identidade Visual e Layout PDF de Geração via WeasyPrint. "O Arquiteto Visual".
**Arquivos de Propriedade Primária:**
- `backend_api/templates/*.html` (Memorial de cálculo HTML)
- `backend_api/templates/css/*.css`
- `frontend/src/assets`
**Trigger:** Melhoria gráfica do report em PDF, "quero que tenha sombra na tabela do laudo", logotipo cortado na impressão, paleta de cores brand guide.

## 5. software-qa-tester
**Foco Mestre:** Estabilidade E2E (Playwright) "Filosofia Usuário Irritado", Unit Tests do Backend (Pytest).
**Arquivos de Propriedade Primária:**
- `frontend/e2e/*.spec.ts`
- `backend_api/tests/*.py`
- `.github/workflows/test.yml`
**Trigger:** E2E falhando, validação dos simuladores no front, regressões detectadas no deploy, testes automatizados fracos.

## 6. technical-doc-validator
**Foco Mestre:** Cruzamento de referências ISO, ASHRAE, ABNT, com implementações nos cálculos de engenharia.
**Arquivos de Propriedade Primária:** (Read-Only Total)
- Lê outputs do motor backend.
- Lê relatórios PDF.
- Ajusta referências normativas passivas em repositórios doc.
**Trigger:** PM fala: "a norma 16401-1 mudou", "verificar se o engenharia-mecânica cobriu a nova lei de eficiência".

## 7. skill-creator
**Foco Mestre:** Expansão Neuro-Operacional da Equipe.
**Arquivos de Propriedade Primária:**
- `.agent/**/SKILL.md`
**Trigger:** O PM fala: "precisamos de um novo agente focado em segurança de nuvem AWS."
