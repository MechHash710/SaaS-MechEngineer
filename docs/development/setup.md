# 🛠 Development Setup

## Pré-requisitos

| Ferramenta | Versão mínima |
| :--- | :--- |
| Python | 3.11+ |
| Node.js | 20+ |
| Docker & Docker Compose | 24+ |
| Git | 2.40+ |

---

## Rodar Localmente (Modo Desenvolvimento)

### Com Docker Compose (recomendado)

```bash
# Clone o repositório
git clone https://github.com/your-org/test-agent.git
cd test-agent

# Crie o arquivo de variáveis de ambiente
cp backend_api/.env.example backend_api/.env
# Edite os valores de STRIPE_SECRET_KEY, DATABASE_URL, etc.

# Sobe toda a stack (PostgreSQL + Backend + Frontend)
docker-compose up --build
```

| Serviço | URL |
| :--- | :--- |
| Frontend (React/Vite) | http://localhost:5174 |
| Backend API (FastAPI) | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

### Modo Manual (sem Docker)

**Backend:**
```powershell
cd backend_api
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Criar banco de dados (SQLite em dev ou PostgreSQL)
alembic upgrade head

# Rodar servidor
python run.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Variáveis de Ambiente

Copie `backend_api/.env.example` → `backend_api/.env` e preencha:

| Variável | Descrição |
| :--- | :--- |
| `DATABASE_URL` | URL de conexão PostgreSQL |
| `SECRET_KEY` | Chave JWT (mínimo 32 chars aleatórios) |
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe (sk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Segredo do Webhook Stripe (whsec_...) |
| `STRIPE_PRICE_PRO` | Price ID do plano Pro no Stripe |
| `STRIPE_PRICE_BUSINESS` | Price ID do plano Business no Stripe |

---

## Rodar Testes

```powershell
# Backend — testes unitários + cobertura
cd backend_api
.\venv\Scripts\python.exe -m pytest -v --cov=. --cov-report=term-missing

# Frontend — testes E2E Playwright
cd frontend
npm run test:e2e

# Load Test (Locust) — requer backend rodando
cd backend_api
.\venv\Scripts\python.exe -m locust -f tests/locustfile.py --headless -u 50 -r 5 -t 60s --host http://localhost:8000
```

---

## Linters e Formatadores

```powershell
# Backend — Ruff
cd backend_api
.\venv\Scripts\python.exe -m ruff check .
.\venv\Scripts\python.exe -m ruff format .

# Frontend — ESLint + Prettier
cd frontend
npm run lint
npm run format
```
