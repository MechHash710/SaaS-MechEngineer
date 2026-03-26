# 🏗 Architecture Overview

## High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  USER BROWSER                                                     │
│  React/Vite - http://localhost:5174                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  AuthContext  │  │  Simulators  │  │  PDF Download Buttons│  │
│  │  (JWT)        │  │  Forms/Results│  │  (blob download)     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
└─────────┼─────────────────┼──────────────────────┼──────────────┘
          │ Bearer Token    │ POST /calculate_hvac  │ POST /memorial
          ▼                 ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  FastAPI - http://localhost:8000                                  │
│  ┌────────────┐  ┌──────────────────────────────────────┐       │
│  │ Auth Router│  │  Simulation Routers (5 simuladores)  │       │
│  │ /auth/*    │  │  /simulation/calculate_hvac           │       │
│  │ JWT + bcypt│  │  /simulation/calculate_solar          │       │
│  └──────┬─────┘  │  /simulation/calculate_ventilation    │       │
│         │        │  /simulation/calculate_efficiency      │       │
│   ┌─────▼─────┐  │  /simulation/calculate_hvac_complete  │       │
│   │ Quota MW  │  └──────────────────────────────────────┘       │
│   │check_quota│  ┌──────────────────────────────────────┐       │
│   └─────┬─────┘  │  Documents Router                     │       │
│         │        │  /documents/*  → PDFGenerator         │       │
│   ┌─────▼─────┐  │  (ReportLab + Jinja2 templates)      │       │
│   │ PostgreSQL│  └──────────────────────────────────────┘       │
│   │ SQLAlchemy│  ┌──────────────────────────────────────┐       │
│   │ Alembic   │  │  Billing Router (Stripe SDK)         │       │
│   └───────────┘  │  /billing/*                           │       │
│                  └──────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼ External APIs
┌──────────────────────────────────────┐
│  Nominatim (OpenStreetMap) — Geocode │
│  Open-Meteo (ERA5) — Irradiação GHI  │
│  Stripe — Pagamentos                  │
└──────────────────────────────────────┘
```

## Camadas do Backend

| Camada | Responsabilidade | Exemplo |
| :--- | :--- | :--- |
| **Routers** | Endpoints HTTP, validação Pydantic | `routers/simulation.py` |
| **Services** | Lógica de negócio e APIs externas | `services/solar_service.py` |
| **Core** | Infraestrutura transversal | `core/middleware.py`, `core/quota.py` |
| **Models** | ORM SQLAlchemy | `models/user.py`, `models/calculation.py` |
| **Templates** | Jinja2 para PDFs | `templates/*.html` |

## Padrão de Cálculo (BaseCalculator)

Todos os simuladores herdam de `core.base_calculator.BaseCalculator`:

```python
class HvacCalculator(BaseCalculator):
    def validate_inputs(self, data) -> List[ValidationAlert]: ...
    async def calculate(self, data) -> CalculationResult: ...
    def format_results(self, result: CalculationResult) -> ThermalOutput: ...
```

Isso garante que todos os simuladores:
1. Validam inputs antes de calcular
2. Retornam `CalculationResult` com `steps`, `summary`, `warnings` e `metadata`
3. Exportam resultados de forma tipada

## Controle de Quotas

O middleware `check_quota` em `core/quota.py` é um `Depends()` injetado em todos os endpoints de simulação e PDF. Ele verifica o `user.plan` e incrementa o contador no banco.
