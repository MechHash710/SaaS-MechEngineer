# 📡 API Overview

**Base URL:** `http://localhost:8000/api/v1`  
**Interactive Docs:** `http://localhost:8000/docs` (Swagger UI)  
**Formato:** JSON  
**Versionamento:** URI (`/api/v1/`)

## Autenticação

A API usa **JWT Bearer Token** (OAuth2).

1. Registre-se via `POST /auth/register` ou faça login via `POST /auth/login`
2. Copie o `access_token` da resposta
3. Inclua em todas as requisições protegidas: `Authorization: Bearer <access_token>`

O token expira. Use `POST /auth/refresh` com o `refresh_token` para renovar sem novo login.

## Headers de Resposta

| Header | Descrição |
| :--- | :--- |
| `X-Process-Time` | Tempo de processamento server-side (em segundos) |
| `Cache-Control` | Política de cache para endpoints GET estáticos |

## Módulos da API

| Módulo | Prefixo | Docs |
| :--- | :--- | :--- |
| Autenticação | `/api/v1/auth` | [auth.md](./auth.md) |
| Simuladores | `/api/v1/simulation` | [simulators.md](./simulators.md) |
| Documentos/PDF | `/api/v1/documents` | [documents.md](./documents.md) |
| Billing/Stripe | `/api/v1/billing` | [billing.md](./billing.md) |
| Admin | `/api/v1/admin` | — |

## Códigos de Status

| Código | Significado |
| :--- | :--- |
| `200` | Sucesso |
| `400` | Dados inválidos / regra de negócio violada |
| `401` | Token ausente ou expirado |
| `403` | Plano insuficiente (quota atingida) |
| `422` | Erro de validação Pydantic |
| `500` | Erro interno |
