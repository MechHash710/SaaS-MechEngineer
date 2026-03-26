# Plataforma de ARTs & Laudos — Simulador de Engenharia Térmica

![Build](https://img.shields.io/github/actions/workflow/status/your-org/test-agent/ci.yml?branch=main&label=build)
![Coverage](https://img.shields.io/badge/coverage-70%25-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

Plataforma SaaS para engenheiros mecânicos que automatiza cálculos, dimensionamentos e geração de ARTs e Laudos Técnicos conforme normas **ABNT NBR** e **ASHRAE**.

---

## Screenshots

| Landing Page | Simulador HVAC | Relatório PDF |
| :---: | :---: | :---: |
| Tela inicial com planos | Formulário + Resultados | Geração de Memorial em PDF |

---

## Quick Start

```bash
# 1. Clone o repositório
git clone https://github.com/your-org/test-agent.git
cd test-agent

# 2. Configure variáveis de ambiente
cp backend_api/.env.example backend_api/.env
# Edite DATABASE_URL, SECRET_KEY, STRIPE_SECRET_KEY...

# 3. Suba a stack com Docker Compose
docker-compose up --build
```

| Serviço | URL |
| :--- | :--- |
| Frontend | http://localhost:5174 |
| API Backend | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |

---

## Funcionalidades

- **5 Simuladores** — HVAC (NBR 16401), Solar (NBR 15569), Ventilação (ASHRAE 62.1), Eficiência (INI-C), HVAC Completo
- **Pipeline de PDF** — Memorial de Cálculo, Laudo Técnico, Especificação, Relatório Completo
- **Trilha de Auditoria** — Cada cálculo expõe fórmulas, constantes e normas utilizadas
- **SaaS com Stripe** — Planos Free / Pro / Business com controle de quotas
- **Auth JWT** — Registro, login, refresh token, controle de acesso por plano

---

## Stack Tecnológica

| Camada | Tecnologia |
| :--- | :--- |
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | FastAPI (Python 3.11) + SQLAlchemy + Alembic |
| Banco de Dados | PostgreSQL 15 |
| PDF | ReportLab + Jinja2 |
| Testes | pytest + Playwright E2E + Locust Load |
| Infra | Docker Compose + GitHub Actions CI/CD |

---

## Documentação

| Link | Descrição |
| :--- | :--- |
| [API Reference](./docs/api/README.md) | Todos os endpoints REST com exemplos |
| [Guia do Usuário](./docs/user-guide/getting-started.md) | Primeiros passos na plataforma |
| [Arquitetura](./docs/development/architecture.md) | Diagrama e camadas do sistema |
| [Dev Setup](./docs/development/setup.md) | Como rodar localmente |
| [Swagger UI](http://localhost:8000/docs) | Documentação interativa da API |

---

## Testes

```bash
# Testes unitários + cobertura (backend)
cd backend_api && .\venv\Scripts\python.exe -m pytest -v --cov=.

# Testes E2E (frontend — requer backend + frontend rodando)
cd frontend && npx playwright test

# Teste de carga (Locust — requer backend rodando)
cd backend_api && .\venv\Scripts\python.exe -m locust -f tests/locustfile.py --headless -u 50 -r 5 -t 60s --host http://localhost:8000
```

---

## Estrutura do Projeto

```
test-agent/
├── backend_api/          # FastAPI + Python
│   ├── routers/          # Endpoints por módulo
│   ├── services/         # Lógica de negócio e APIs externas
│   ├── core/             # Infraestrutura (auth, quota, validators)
│   ├── models/           # ORM SQLAlchemy
│   ├── templates/        # Jinja2 para PDFs
│   └── tests/            # pytest + locustfile
├── frontend/             # React + TypeScript + Vite
│   ├── src/modules/      # Simuladores (HVAC, Solar, etc.)
│   ├── src/pages/        # Páginas (Landing, Onboarding, etc.)
│   └── e2e/              # Playwright E2E tests
├── docs/                 # Documentação técnica e de usuário
├── docker-compose.yml    # Stack de desenvolvimento
└── .github/workflows/    # CI/CD GitHub Actions
```
