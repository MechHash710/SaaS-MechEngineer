# 📚 Plataforma de ARTs & Laudos — Documentação

Bem-vindo à documentação oficial da **Plataforma de Simulação de Engenharia Térmica**.

## Índice

| Seção | Descrição |
| :--- | :--- |
| [📡 API Reference](./api/README.md) | Endpoints REST, autenticação e exemplos |
| [👤 User Guide](./user-guide/getting-started.md) | Guia do usuário, fluxos, FAQ |
| [🛠 Development](./development/setup.md) | Como rodar localmente, arquitetura, contribuição |

---

## Visão Geral

A plataforma oferece simuladores de engenharia mecânica baseados em normas ABNT e ASHRAE:

- **5 Simuladores** – Carga Térmica HVAC, Aquecimento Solar, Ventilação, Eficiência Energética INI-C e HVAC Completo
- **Geração de PDFs** – Memoriais de Cálculo, Laudos Técnicos, Especificações e Relatório Completo
- **SaaS com Stripe** – Planos Free, Pro e Business com controle de quotas
- **Trilha de Auditoria** – Cada simulação expõe fórmulas, normas e constantes utilizadas

## Quick Start

```bash
# Clone o repositório
git clone https://github.com/your-org/test-agent.git

# Sobe toda a stack com Docker Compose
docker-compose up --build
```

- **Frontend:** http://localhost:5174  
- **Backend API:** http://localhost:8000  
- **Swagger UI:** http://localhost:8000/docs  
