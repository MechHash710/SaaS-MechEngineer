import time

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request

from core.dependencies import get_current_user
from core.middleware import RateLimitMiddleware
from routers import (
    admin,
    auth,
    billing,
    budgeting,
    documents,
    energy_efficiency,
    feedback,
    health,
    hvac_complete,
    simulation,
    solar_heating,
    ventilation,
)

app = FastAPI(
    title="Plataforma de Simulação de Engenharia Térmica — API",
    description=(
        "API REST para dimensionamento de sistemas de HVAC, Aquecimento Solar, Ventilação e "
        "Eficiência Energética conforme normas ABNT NBR e ASHRAE.\n\n"
        "**Autenticação:** Bearer Token JWT. Obtenha um token em `POST /api/v1/auth/login`.\n\n"
        "**Quotas:** As simulações e PDFs são limitadas por plano (Free/Pro/Business). "
        "Erros HTTP 403 indicam quota atingida.\n\n"
        "📖 [Documentação completa](./docs)"
    ),
    version="1.0.0",
    contact={"name": "Suporte Técnico", "email": "suporte@plataforma.eng.br"},
    license_info={"name": "Proprietário", "url": "https://plataforma.eng.br/termos"},
    openapi_tags=[
        {
            "name": "Auth",
            "description": "Registro, login, refresh e informações do usuário autenticado.",
        },
        {
            "name": "Simulation",
            "description": "Simuladores de carga térmica, solar, ventilação, eficiência energética e HVAC completo.",
        },
        {
            "name": "SolarHeating",
            "description": "Dimensionamento de sistema de Aquecimento Solar de AQS (NBR 15569).",
        },
        {
            "name": "Documents",
            "description": "Geração de PDFs: Memorial de Cálculo, Laudo Técnico, Especificação e Relatório Completo.",
        },
        {
            "name": "Billing",
            "description": "Gerenciamento de assinatura via Stripe (checkout, portal, webhook).",
        },
        {
            "name": "Admin",
            "description": "Métricas da plataforma e gestão de usuários (acesso restrito a administradores).",
        },
    ],
)

import sentry_sdk

from core.config import settings

if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=0.1
    )

# Parse comma-separated CORS origins from ENV variables
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]

# Configuração de CORS (Permitir acesso do Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware, max_requests=60, window_seconds=60)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)

    if (
        request.method == "GET"
        and response.status_code == 200
        and "Cache-Control" not in response.headers
    ):
        response.headers["Cache-Control"] = "public, max-age=60"

    return response


app.include_router(health.router, prefix="", tags=["Health"])

# Inclusão das rotas (Endpoints)
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])

# Protected routes
protected_deps = [Depends(get_current_user)]
app.include_router(
    simulation.router, prefix="/api/v1/simulation", tags=["Simulation"], dependencies=protected_deps
)
app.include_router(
    solar_heating.router,
    prefix="/api/v1/simulation",
    tags=["SolarHeating"],
    dependencies=protected_deps,
)
app.include_router(
    budgeting.router, prefix="/api/v1/budgeting", tags=["Budgeting"], dependencies=protected_deps
)
app.include_router(
    documents.router, prefix="/api/v1/documents", tags=["Documents"], dependencies=protected_deps
)
app.include_router(
    billing.router, prefix="/api/v1/billing", tags=["Billing"], dependencies=protected_deps
)
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(
    ventilation.router,
    prefix="/api/v1/simulation",
    tags=["Simulation"],
    dependencies=protected_deps,
)
app.include_router(
    energy_efficiency.router,
    prefix="/api/v1/simulation",
    tags=["Simulation"],
    dependencies=protected_deps,
)
app.include_router(
    hvac_complete.router,
    prefix="/api/v1/simulation",
    tags=["Simulation"],
    dependencies=protected_deps,
)

# Feedback — public beta_invite; submit/admin are auth-protected
app.include_router(feedback.router, prefix="/api/v1/feedback", tags=["Feedback"])


@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Bem-vindo à API do Simulador Térmico. Acesse /docs para visualizar os endpoints.",
    }
