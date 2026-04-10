import { useState, useMemo } from "react";

const PROJECT_DATA = {
  milestones: [
    { id: "M1", name: "Fundação & Arquitetura", color: "#E85D26" },
    { id: "M2", name: "Motor de Cálculo", color: "#2E86DE" },
    { id: "M3", name: "Frontend & Interface", color: "#10AC84" },
    { id: "M4", name: "Geração de Documentos", color: "#8854D0" },
    { id: "M5", name: "Revisão Técnica", color: "#F7B731" },
    { id: "M6", name: "SaaS & Monetização", color: "#FC5C65" },
    { id: "M7", name: "Testes & QA", color: "#4B6584" },
    { id: "M8", name: "Deploy & Infraestrutura", color: "#22C55E" },
    { id: "M9", name: "EnergyPlus Premium (BR)", color: "#0EA5E9" },
  ],
  tasks: [
    // M1 — Fundação & Arquitetura
    { id: "T01", milestone: "M1", status: "Done", name: "Definir stack final (Next.js + Python FastAPI + PostgreSQL)", desc: "Stack definida e em uso: FastAPI (Python) + React/Vite (TypeScript) + Tailwind CSS. Decisão documentada nos agents .agent/. Obs: adotado Vite em vez de Next.js e sem PostgreSQL por ora.", effort: "S", hours: 4, deadline: "Sem 1", priority: "High", deps: [] },
    { id: "T02", milestone: "M1", status: "Done", name: "Configurar monorepo e ambiente de dev", desc: "Estrutura monorepo criada (backend_api/ + frontend/ + env/). Scripts run.bat, install.bat e Makefile presentes. Configurados Docker Compose, linters (Ruff/ESLint) e formatters (Ruff/Prettier).", effort: "M", hours: 12, deadline: "Sem 1", priority: "High", deps: ["T01"] },
    { id: "T03", milestone: "M1", status: "Done", name: "Modelar banco de dados (PostgreSQL)", desc: "Criados models sqlalchemy (User, Project, Calculation, Document), database.py, configurado Alembic e inicializado autogenerate. Atualizado docker-compose.yml.", effort: "M", hours: 16, deadline: "Sem 2", priority: "High", deps: ["T01"] },
    { id: "T04", milestone: "M1", status: "Done", name: "Implementar autenticação e autorização", desc: "JWT + bcrypt configurados no backend (security.py, auth.py, dependencies.py). Rota /login e /register prontas.", effort: "L", hours: 24, deadline: "Sem 2-3", priority: "High", deps: ["T02", "T03"] },
    { id: "T05", milestone: "M1", status: "Done", name: "Criar estrutura base da API (FastAPI)", desc: "FastAPI com 4 routers (simulation, solar_heating, budgeting, documents), schemas Pydantic, CORS configurado, error handling e serviço de camada de negócio (services/solar_service.py).", effort: "M", hours: 16, deadline: "Sem 3", priority: "High", deps: ["T02", "T03"] },
    { id: "T06", milestone: "M1", status: "Done", name: "Setup CI/CD pipeline", desc: "Github Actions workflows para CI (lint, tests) e docker-build para deploy; criado PULL_REQUEST_TEMPLATE.md.", effort: "M", hours: 12, deadline: "Sem 3", priority: "Medium", deps: ["T02"] },

    // M2 — Motor de Cálculo
    { id: "T07", milestone: "M2", status: "Done", name: "Arquitetar engine de cálculo modular", desc: "Engine modular completa: core/base_calculator.py com classe abstrata BaseCalculator (ABC), dataclasses CalculationStep e CalculationResult padronizados. core/unit_converter.py com conversões BTU/h↔kW↔W, °C↔°F, m²↔ft², L/h↔m³/h. Routers simulation.py e solar_heating.py refatorados para herdar BaseCalculator e usar unit_converter.", effort: "L", hours: 24, deadline: "Sem 4", priority: "High", deps: ["T05"] },
    { id: "T08", milestone: "M2", status: "Done", name: "Simulador 1: Carga Térmica (NBR 16401)", desc: "Implementado em routers/simulation.py. Inputs: área, pé-direito, ocupantes, equipamentos, exposição solar, localização. Output: BTU total, watts, equipamento recomendado, memorial passo-a-passo, warnings, referências ABNT/ASHRAE. Integração com API Open-Meteo para GHI local.", effort: "XL", hours: 60, deadline: "Sem 5-6", priority: "High", deps: ["T07"] },
    { id: "T09", milestone: "M2", status: "Done", name: "Simulador 2: Aquecimento Solar (NBR 15569)", desc: "Implementado em routers/solar_heating.py + services/solar_service.py. Inputs: localização, ocupantes, consumo, ΔT, tipo de sistema e coletor, orientação/inclinação. Output: área de coletores, volume reservatório, fração solar, análise financeira (R$/ano), memorial passo-a-passo.", effort: "XL", hours: 50, deadline: "Sem 6-7", priority: "High", deps: ["T07"] },
    { id: "T10", milestone: "M2", status: "Done", name: "Simulador 3: Dimensionamento de Ventilação", desc: "Criados form, result e report no frontend, além de backend router p/ calcular vazão, ACH e dutos baseados na ASHRAE 62.1.", effort: "XL", hours: 50, deadline: "Sem 7-8", priority: "Medium", deps: ["T07"] },
    { id: "T11", milestone: "M2", status: "Done", name: "Simulador 4: Eficiência Energética (INI-C)", desc: "Avaliação de carga, cálculo de consumo anual, indicador de eficiência kWh/m2.ano e classificação PBE Edifica.", effort: "XL", hours: 60, deadline: "Sem 8-9", priority: "Medium", deps: ["T07"] },
    { id: "T12", milestone: "M2", status: "Done", name: "Simulador 5: HVAC Completo", desc: "Integra carga térmica + ventilação + seleção de equipamento. Dimensionamento de dutos, tubulações, seleção de condensadora/evaporadora e geração de laudo consolidado no front.", effort: "XL", hours: 80, deadline: "Sem 9-11", priority: "High", deps: ["T08", "T10"] },
    { id: "T13", milestone: "M2", status: "Done", name: "Testes unitários dos motores de cálculo", desc: "Suite de testes completa em backend_api/tests/: test_simulation.py (carga típica, inputs inválidos, warnings, calculation_steps, recomendação de equipamento), test_solar_heating.py (dimensionamento, análise financeira, fração solar), test_budgeting.py (geração de orçamento, escalonamento por BTU, campos obrigatórios). pytest + pytest-cov configurados. Cobertura ~70%.", effort: "L", hours: 30, deadline: "Sem 11-12", priority: "High", deps: ["T08", "T09", "T10", "T11"] },

    // M3 — Funcionalidades de Plataforma
    { id: "T14", milestone: "M3", status: "Done", name: "Design system e componentes base", desc: "Design system completo em frontend/src/components/ui/: Button (variantes primary/secondary/ghost/danger, tamanhos sm/md/lg, estados loading/disabled), Select (compatível com React Hook Form), Modal (overlay + backdrop blur, ESC/clique fora), Toast + useToast (success/error/warning/info, auto-dismiss 4s), DataTable (colunas configuráveis, zebra, responsivo), index.ts exportando tudo.", effort: "L", hours: 30, deadline: "Sem 4-5", priority: "High", deps: ["T01"] },
    { id: "T15", milestone: "M3", status: "Done", name: "Telas de autenticação (login, registro, recuperação)", desc: "Páginas LoginPage, RegisterPage, ForgotPasswordPage integradas com AuthContext e ProtectedRoute no frontend.", effort: "L", hours: 24, deadline: "Sem 8-9", priority: "Medium", deps: ["T04"] },
    { id: "T16", milestone: "M3", status: "Done", name: "Dashboard principal do engenheiro", desc: "Dashboard implementado com resumo de simulações, uso do plano, e tabela de histórico recente salva no localStorage. Integração com o fluxo em App.tsx finalizada.", effort: "L", hours: 24, deadline: "Sem 5-6", priority: "High", deps: ["T14"] },
    { id: "T17", milestone: "M3", status: "Done", name: "Formulários dinâmicos dos simuladores", desc: "HVACForm.tsx e SolarForm.tsx com React Hook Form + Zod. Validação em tempo real, unidades de engenharia, campos condicionais, mensagens de erro descritivas. Schemas hvacSchema.ts e solarSchema.ts completos.", effort: "XL", hours: 50, deadline: "Sem 6-8", priority: "High", deps: ["T07", "T14"] },
    { id: "T18", milestone: "M3", status: "Done", name: "Tela de resultados e visualização", desc: "Gráficos integrados com Recharts (Breakdown de carga térmica no HVAC, e Pizza/Linha temporal para energia solar). Badges de conformidade ABNT adicionados, assim como tabela estruturada comparativa de equipamentos.", effort: "L", hours: 30, deadline: "Sem 8-9", priority: "High", deps: ["T17"] },
    { id: "T19", milestone: "M3", status: "Done", name: "Gestão de projetos do usuário", desc: "Criada ProjectsPage.tsx e integrada ao App.tsx. Salva/lê do localStorage.", effort: "M", hours: 16, deadline: "Sem 9-10", priority: "Medium", deps: ["T16"] },

    // M4 — Geração de Documentos
    { id: "T20", milestone: "M4", status: "Done", name: "Arquitetar pipeline de geração de PDF", desc: "Pipeline completo: backend_api/services/pdf_service.py com PDFGenerator (ReportLab + Jinja2), cabeçalho, rodapé com numeração de páginas e norma de referência. backend_api/templates/base.html como layout base. documents.py atualizado para usar PDFService. Fundação que viabilizou T21, T22, T23 e T28.", effort: "L", hours: 30, deadline: "Sem 10", priority: "High", deps: ["T05", "T13"] },
    { id: "T21", milestone: "M4", status: "Done", name: "Template: Memorial de Cálculo", desc: "Templates memorial_calculo.html criados em Jinja2 com campos para engineer_crea, localizacao, passo-a-passo. Integração com botão no frontend nas abas de resultados HVAC/Solar usando o endpoint respectivo.", effort: "L", hours: 20, deadline: "Sem 10", priority: "High", deps: ["T20"] },
    { id: "T22", milestone: "M4", status: "Done", name: "Template: Laudo Técnico", desc: "Criado laudo_tecnico.html. Adicionado endpoint /laudo/{tipo} em documents.py e botões de download no frontend.", effort: "M", hours: 16, deadline: "Sem 11", priority: "High", deps: ["T20"] },
    { id: "T23", milestone: "M4", status: "Done", name: "Template: Especificação de Equipamento", desc: "Criada estrutura HTML em Jinja2 e endpoint no backend p/ PDF de especificacao. Botão 'Especificação Técnica' injetado no relatorio HVAC p/ gerar spec sheet + BOM.", effort: "L", hours: 24, deadline: "Sem 13", priority: "Medium", deps: ["T20"] },
    { id: "T24", milestone: "M4", status: "Done", name: "Template: Relatório Técnico Completo", desc: "Criado relatorio_completo.html agregando todas as etapas (Memorial, Laudo, BOM). Endpoint /relatorio_completo criado e botões no frontend.", effort: "L", hours: 30, deadline: "Sem 13", priority: "High", deps: ["T20", "T21", "T22", "T23"] },

    // M5 — Revisão Técnica
    { id: "T25", milestone: "M5", status: "Done", name: "Motor de rastreabilidade de cálculos", desc: "simulation.py e solar_heating.py geram step_by_step com: fórmula, valores de entrada, resultado intermediário e norma de referência para cada etapa. Implementado nas respostas da API como 'calculation_steps'.", effort: "L", hours: 30, deadline: "Sem 12-13", priority: "High", deps: ["T13"] },
    { id: "T26", milestone: "M5", status: "Done", name: "Interface passo-a-passo de auditoria", desc: "Componente AuditSteps.tsx criado e integrado em HVACResults.tsx e SolarResults.tsx. Visualização expansível por etapa com premissas (constants) e resultados intermediários (step_by_step). Interface unificada para HVAC e Solar.", effort: "L", hours: 30, deadline: "Sem 13-14", priority: "High", deps: ["T18", "T25"] },
    { id: "T27", milestone: "M5", status: "Done", name: "Sistema de validação cruzada", desc: "Criado core/validators.py retornando ValidationAlert typed com severity (info/warning/critical) e message. Refletido via types no frontend (AlertList styled). Limitando BTU extremos, volume absurdos.", effort: "L", hours: 24, deadline: "Sem 14", priority: "Medium", deps: ["T25"] },
    { id: "T28", milestone: "M5", status: "Done", name: "Exportar trilha de auditoria no PDF", desc: "Incluída seção 'Premissas e Referências Normativas' no memorial_calculo.html com constants_used e references passados no payload do backend.", effort: "M", hours: 16, deadline: "Sem 14-15", priority: "Medium", deps: ["T25", "T21"] },

    // M6 — SaaS & Monetização
    { id: "T29", milestone: "M6", status: "Done", name: "Integrar gateway de pagamento (Stripe/Mercado Pago)", desc: "Integração completa com Stripe: create_checkout_session com price_ids, billing_portal para gestão de assinatura, e webhook processando pagamentos e cancelamentos. Páginas Pricing, Billing e BillingSuccess configuradas.", effort: "XL", hours: 50, deadline: "Sem 14-15", priority: "High", deps: ["T04", "T16"] },
    { id: "T30", milestone: "M6", status: "Done", name: "Sistema de controle de acesso por plano", desc: "Middleware de quotas e limite de taxa. Interceptor Axios lida com expiração e upgrade de planos.", effort: "L", hours: 24, deadline: "Sem 15-16", priority: "High", deps: ["T29"] },
    { id: "T31", milestone: "M6", status: "Done", name: "Dashboard admin (métricas e gestão)", desc: "Painel admirativo criado. Endpoints protegidos, métricas de MRR e simulações, edição de plano manual.", effort: "L", hours: 30, deadline: "Sem 16", priority: "Medium", deps: ["T29"] },

    // M7 — Testes & QA
    { id: "T32", milestone: "M7", status: "Done", name: "Landing page e onboarding", desc: "Criada LandingPage.tsx com features e preços. OnboardingPage.tsx com fluxo de tutorial guiado inicial integrado no App.tsx.", effort: "M", hours: 16, deadline: "Sem 16", priority: "Low", deps: ["T14"] },
    { id: "T33", milestone: "M7", status: "Done", name: "Testes de integração end-to-end", desc: "3 spec files ativos: main-flow.spec.ts (atualizado), simulators-complete.spec.ts (408 linhas — Ventilação, Eficiência, HVAC Completo com mock de auth), feedback.spec.ts (164 linhas — FeedbackWidget E2E). playwright.config.ts atualizado: timeout 60s, retries 1, trace on-failure, webServer auto-start. authService.ts corrigido (localStorage keys consistentes @EngenhariaPro:token/@EngenhariaPro:refresh_token). Último run: 22 testes todos passando e refatorado com mocks nas simulações.", effort: "L", hours: 30, deadline: "Sem 17-18", priority: "High", deps: ["T24", "T26", "T30", "T67", "T68", "T69"] },
    { id: "T34", milestone: "M7", status: "Done", name: "Testes de carga e performance", desc: "Locust configurado em backend_api/tests/locustfile.py com 3 cenários: CommonEngineer (peso 3), IntenseUsage (peso 1), Stress ramp-up (50 usuários). Todos os P95 aprovados: HVAC=96ms, Solar=85ms, Ventilação=72ms, Eficiência=66ms, PDF=1230ms (meta: <2s/<5s). Relatório completo em backend_api/tests/PERFORMANCE_REPORT.md. CSVs de resultado salvos.", effort: "L", hours: 24, deadline: "Sem 18", priority: "High", deps: ["T33"] },
    { id: "T35", milestone: "M7", status: "Done", name: "Documentação técnica e de usuário", desc: "Estrutura docs/ completa: docs/api/ (auth.md, billing.md, documents.md, simulators.md), docs/development/ (setup.md, architecture.md, contributing.md, DEPLOY.md, DEPLOY_BEGINNER_GUIDE.md). docs/user-guide/ com todos os simuladores: energy-efficiency-simulator.md, ventilation-simulator.md, troubleshooting.md, hvac-simulator.md, hvac-complete-simulator.md. Guia deploy.md atualizado para fluxo Railway atual.", effort: "L", hours: 30, deadline: "Sem 19-20", priority: "Medium", deps: ["T33"] },

    // M8 — Deploy & Infraestrutura (Fase 1: MVP Barato)
    { id: "T54", milestone: "M8", status: "To Do", name: "Configurar Cloudflare para thermes.com.br", desc: "Criar conta Cloudflare, adicionar site thermes.com.br, apontar nameservers do Registro.br para Cloudflare (ns1/ns2.cloudflare.com). Ativar SSL Full Strict (grátis), cache, proteção DDoS, Page Rules para cache de assets.", effort: "S", hours: 2, deadline: "Sem 17", priority: "High", deps: [] },
    { id: "T55", milestone: "M8", status: "Done", name: "Preparar app para deploy cloud-native", desc: "railway.toml criado: builder NIXPACKS, buildCommand 'npm run build', startCommand 'uvicorn main:app', healthcheckPath '/health', restartPolicy ON_FAILURE (3 retries). Dockerfile.prod multi-stage para FastAPI (builder python:3.11-slim + runtime com gunicorn+uvicorn workers). Dockerfile.prod para frontend (node:20-alpine build + nginx:alpine serving). nginx.conf configurado para SPA routing.", effort: "M", hours: 8, deadline: "Sem 17", priority: "High", deps: ["T06"] },
    { id: "T56", milestone: "M8", status: "Done", name: "Abstrair configuração de infraestrutura", desc: "backend_api/core/config.py criado com Pydantic BaseSettings: ENVIRONMENT, SECRET_KEY, CORS_ORIGINS (lista de origens incluindo thermes.com.br), DATABASE_URL (default SQLite para dev, override com PostgreSQL URL no Railway via .env). Suporte a env_file='.env'. Pronto para deploy multi-ambiente.", effort: "M", hours: 6, deadline: "Sem 17", priority: "High", deps: ["T55"] },
    { id: "T57", milestone: "M8", status: "To Do", name: "Deploy backend FastAPI no Railway", desc: "Criar projeto Railway, conectar repo GitHub, configurar variáveis (DATABASE_URL, SECRET_KEY, CORS_ORIGINS). Provisionar PostgreSQL managed. Configurar domínio customizado api.thermes.com.br. Testar endpoints /health e /docs.", effort: "M", hours: 4, deadline: "Sem 17", priority: "High", deps: ["T54", "T55", "T56"] },
    { id: "T58", milestone: "M8", status: "To Do", name: "Deploy frontend React no Railway/Vercel", desc: "Build de produção do Vite (npm run build). Deploy como static site. Configurar VITE_API_URL para https://api.thermes.com.br. Apontar thermes.com.br e www.thermes.com.br. Configurar redirects e fallback para SPA.", effort: "S", hours: 3, deadline: "Sem 17", priority: "High", deps: ["T54", "T55"] },
    { id: "T59", milestone: "M8", status: "To Do", name: "Configurar storage para PDFs (R2/S3)", desc: "Criar bucket no Cloudflare R2 (ou AWS S3). Configurar CORS e lifecycle rules (expirar PDFs após 30 dias). Atualizar pdf_service.py para salvar em object storage ao invés de filesystem local. Criar endpoint para download assinado.", effort: "M", hours: 6, deadline: "Sem 17-18", priority: "High", deps: ["T57"] },
    { id: "T60", milestone: "M8", status: "To Do", name: "Configurar monitoramento básico", desc: "Integrar Sentry para error tracking (free tier). Configurar health checks no Railway. Criar endpoint /health que verifica DB connection. Alertas por email para erros críticos.", effort: "S", hours: 4, deadline: "Sem 18", priority: "Medium", deps: ["T57", "T58"] },
    { id: "T61", milestone: "M8", status: "To Do", name: "Configurar backup automático do PostgreSQL", desc: "Railway já faz backup diário. Configurar pg_dump semanal para Cloudflare R2 como redundância. Script de restore documentado.", effort: "S", hours: 3, deadline: "Sem 18", priority: "Medium", deps: ["T57"] },
    { id: "T62", milestone: "M8", status: "To Do", name: "Configurar CI/CD para deploy automático", desc: "GitHub Actions: on push to main → run tests → deploy backend → deploy frontend. Rollback automático se health check falhar. Slack notification de deploy.", effort: "M", hours: 6, deadline: "Sem 18", priority: "High", deps: ["T57", "T58", "T06"] },
    { id: "T63", milestone: "M8", status: "To Do", name: "Soft launch thermes.com.br", desc: "Verificar todos os endpoints funcionando. Testar fluxo completo: registro → login → simulação → PDF. Convidar 5-10 beta testers. Monitorar logs e erros por 48h.", effort: "M", hours: 8, deadline: "Sem 18", priority: "High", deps: ["T57", "T58", "T59", "T60"] },

    // M8 — Fase 2: Preparação para Escala (depois de validar)
    { id: "T64", milestone: "M8", status: "To Do", name: "Adicionar Redis para cache e sessões", desc: "Provisionar Redis no Railway (ou Upstash free tier). Configurar caching de resultados de simulação (key: hash dos inputs). Cache de sessões JWT. Reduz carga no PostgreSQL.", effort: "M", hours: 6, deadline: "Sem 20", priority: "Medium", deps: ["T63"] },
    { id: "T65", milestone: "M8", status: "To Do", name: "Documentar processo de migração de plataforma", desc: "Criar DEPLOY.md com instruções para migrar de Railway para: (1) DigitalOcean App Platform, (2) AWS ECS/Fargate, (3) GCP Cloud Run. Incluir scripts Terraform opcionais. Garantir que a migração leva menos de 2 horas.", effort: "L", hours: 12, deadline: "Sem 20", priority: "Medium", deps: ["T63"] },
    { id: "T66", milestone: "M8", status: "To Do", name: "Implementar rate limiting e proteção de API", desc: "Rate limit por IP e por usuário (slowapi ou redis-based). Proteção contra scraping. Validação de inputs mais rigorosa. Logs de tentativas suspeitas.", effort: "M", hours: 8, deadline: "Sem 20", priority: "Medium", deps: ["T64"] },

    // M9 — EnergyPlus Premium (BR)
    { id: "T38", milestone: "M9", status: "To Do", name: "Fork EnergyPlus + Docker container", desc: "Fork do NREL/EnergyPlus no GitHub. Criar Dockerfile com EnergyPlus v25.2 fixo + pyenergyplus. Testar execução de IDF de exemplo dentro do container. Base para todo o módulo Premium.", effort: "L", hours: 20, deadline: "Sem 21", priority: "High", deps: ["T63"] },
    { id: "T39", milestone: "M9", status: "To Do", name: "Camada de abstração Python (engine interface)", desc: "Criar classe abstrata SimulationEngine com métodos run(), parse_results(), validate_input(). Implementação concreta EnergyPlusEngine usando pyenergyplus API (runtime + exchange + functional). Permite trocar motor no futuro sem reescrever a plataforma.", effort: "L", hours: 24, deadline: "Sem 21-22", priority: "High", deps: ["T38"] },
    { id: "T40", milestone: "M9", status: "To Do", name: "Biblioteca de materiais construtivos BR", desc: "Criar dataset IDF com materiais brasileiros: bloco cerâmico 9/14/19cm, bloco concreto 14/19cm, concreto moldado in loco 5-20cm, argamassa cimento-areia, reboco, gesso, telha cerâmica/fibrocimento/metálica, laje pré-moldada + EPS, drywall. Propriedades térmicas validadas contra NBR 15220-2 e biblioteca LabEEE/UFSC.", effort: "XL", hours: 40, deadline: "Sem 22-23", priority: "High", deps: ["T38"] },
    { id: "T41", milestone: "M9", status: "To Do", name: "Gerenciador de arquivos EPW brasileiros", desc: "Coletar e indexar arquivos EPW do INMET/TMYx para 400+ cidades brasileiras (Climate.OneBuilding.org). Criar mapeamento cidade→ZB→EPW. API endpoint que recebe CEP ou município e retorna arquivo climático + zona bioclimática + dias típicos verão/inverno.", effort: "L", hours: 24, deadline: "Sem 22-23", priority: "High", deps: ["T38"] },
    { id: "T42", milestone: "M9", status: "To Do", name: "Gerador automático de arquivos IDF", desc: "Motor Python que recebe JSON do formulário do usuário e gera IDF completo: Zone, BuildingSurface:Detailed (coordenadas 3D), Construction (camadas), FenestrationSurface:Detailed, People, Lights, ElectricEquipment, Schedules, Output:Variable. Usar HVACTemplate para sistemas. Validação contra Energy+.idd.", effort: "XL", hours: 50, deadline: "Sem 23-25", priority: "High", deps: ["T39", "T40", "T41"] },
    { id: "T43", milestone: "M9", status: "To Do", name: "Schedules de uso brasileiros por tipologia", desc: "Criar biblioteca de Schedule:Compact para: residencial (NBR 15575 padrão), escritório comercial (8h-18h), comércio/varejo (9h-21h), escola, hospital, hotel. Ocupação, iluminação e equipamentos por tipologia. Densidades de carga W/m² conforme normas brasileiras.", effort: "M", hours: 16, deadline: "Sem 23", priority: "Medium", deps: ["T40"] },
    { id: "T44", milestone: "M9", status: "To Do", name: "Parser de outputs EnergyPlus → dados estruturados", desc: "Módulo Python que lê CSV/ESO/HTML do EnergyPlus e extrai: temperaturas operativas horárias por zona, cargas térmicas, consumo energético por uso final, condições de conforto. Retorna dataclass tipada para consumo pela plataforma.", effort: "L", hours: 24, deadline: "Sem 25-26", priority: "High", deps: ["T42"] },
    { id: "T45", milestone: "M9", status: "To Do", name: "Lógica de verificação NBR 15575:2021", desc: "Implementar cálculo de PHFT (Percentual de Horas na Faixa de Temperatura Operativa), Tomáx (Temperatura Operativa Máxima Anual) e CgTT (Carga Térmica Total) conforme NBR 15575:2021. Classificação Mínimo/Intermediário/Superior por zona e por ZB. Verificação de condensação.", effort: "XL", hours: 40, deadline: "Sem 26-27", priority: "High", deps: ["T44"] },
    { id: "T46", milestone: "M9", status: "To Do", name: "Gerador automático de edifício de referência", desc: "Dado o modelo real do usuário, gerar automaticamente o modelo de referência conforme NBR 15575: mesma geometria, U e CT das paredes/cobertura conforme limites prescritivos da ZB, mesmas cargas internas. Rodar ambas as simulações e comparar resultados.", effort: "L", hours: 30, deadline: "Sem 27-28", priority: "High", deps: ["T42", "T45"] },
    { id: "T47", milestone: "M9", status: "To Do", name: "Template de Laudo Térmico NBR 15575 (PDF)", desc: "Template Jinja2 + ReportLab para laudo completo: dados do projeto, descrição construtiva, gráficos temperatura interna vs. externa, tabela PHFT/Tomáx/CgTT por ambiente, comparativo real vs. referência, classificação de desempenho, conclusão técnica. Em português, formato profissional.", effort: "L", hours: 24, deadline: "Sem 28-29", priority: "High", deps: ["T20", "T45", "T46"] },
    { id: "T48", milestone: "M9", status: "To Do", name: "Integração Zone/System Sizing com módulo ART", desc: "Usar EnergyPlus Zone Sizing + System Sizing para calcular cargas térmicas detalhadas via simulação (mais preciso que método simplificado do T08). Gerar relatório ZSZ/SSZ com picos de carga por zona, mês e hora. Vincular ao fluxo de geração de ART existente.", effort: "L", hours: 30, deadline: "Sem 29-30", priority: "High", deps: ["T42", "T12"] },
    { id: "T49", milestone: "M9", status: "To Do", name: "Templates HVAC brasileiros (HVACTemplate)", desc: "Criar conjuntos pré-definidos de HVACTemplate para os sistemas mais comuns no Brasil: Split/Multi-split (Unitary), VRF (sistema com recuperação de calor), Self-contained, Fan coil + chiller (VAV ou CAV), Roof-top. Cada template com defaults brasileiros (COP típico, eficiência, Sizing:Parameters 1.2).", effort: "L", hours: 30, deadline: "Sem 29-30", priority: "High", deps: ["T42", "T43"] },
    { id: "T50", milestone: "M9", status: "To Do", name: "Memorial de cálculo por simulação (PDF ART)", desc: "Gerar memorial de cálculo detalhado a partir dos resultados do EnergyPlus: carga térmica por zona (sensível + latente), condições de projeto (TBS/TBU), dimensionamento de equipamentos com fator de segurança, vazões de ar e água. Formato para anexar à ART.", effort: "L", hours: 24, deadline: "Sem 30-31", priority: "High", deps: ["T44", "T48"] },
    { id: "T51", milestone: "M9", status: "To Do", name: "Implementar regras INI-C para edifício de referência", desc: "Implementar lógica completa do INI-C (Instrução Normativa INMETRO para comerciais): geração do modelo de referência conforme requisitos prescritivos, cálculo de consumo energético primário, classificação A-E. Integrar com módulo de eficiência energética existente (T11) para versão premium via simulação.", effort: "XL", hours: 60, deadline: "Sem 31-33", priority: "Medium", deps: ["T42", "T46"] },
    { id: "T52", milestone: "M9", status: "To Do", name: "Comparativo real vs. referência + classificação ENCE", desc: "Rodar simulação do edifício real e do edifício de referência INI-C. Calcular percentual de economia, classificar envoltória e sistema de iluminação+condicionamento. Gerar relatório comparativo com gráficos de consumo por uso final. Formato compatível com submissão ao INMETRO.", effort: "XL", hours: 50, deadline: "Sem 33-35", priority: "Medium", deps: ["T51"] },
    { id: "T53", milestone: "M9", status: "To Do", name: "Frontend Premium: formulário guiado + visualização 3D", desc: "Interface React para módulo Premium: wizard passo-a-passo (localização → geometria → materiais → HVAC → simular), seletor visual de materiais com propriedades térmicas, preview 3D simplificado da edificação (Three.js ou SVG isométrico), dashboard de resultados com gráficos Recharts. Gate de acesso por plano Premium.", effort: "XL", hours: 60, deadline: "Sem 33-36", priority: "High", deps: ["T14", "T42", "T47", "T30"] },

    // T37 movido para depois do soft launch
    { id: "T37", milestone: "M7", status: "To Do", name: "Coleta estruturada de feedback beta", desc: "Beta fechado com 10-20 engenheiros após soft launch. Coleta estruturada de feedback via formulário, bugs, sugestões. Iteração rápida.", effort: "L", hours: 30, deadline: "Sem 19-20", priority: "High", deps: ["T63", "T35"] },

    // M7 — Sub-tarefas de QA descobertas durante execução
    { id: "T67", milestone: "M7", status: "Done", name: "Fix: localStorage key mismatch no authService.ts", desc: "Corrigido bug onde refreshToken() usava chave diferente da usada no login(). Agora ambos utilizam '@EngenhariaPro:token' e '@EngenhariaPro:refresh_token' de forma consistente. Era o principal bloqueador dos testes E2E que dependiam de autenticação real.", effort: "S", hours: 3, deadline: "Sem 17", priority: "High", deps: ["T15"] },
    { id: "T68", milestone: "M7", status: "Done", name: "Expandir suite E2E: simulators-complete + feedback", desc: "Criados 2 novos spec files: simulators-complete.spec.ts (408 linhas — cobertura E2E de Ventilação, Eficiência Energética e HVAC Completo com padrão de mock de auth via localStorage + page.route) e feedback.spec.ts (164 linhas — FeedbackWidget completo: visibilidade, submit, mock de API). playwright.config.ts atualizado: timeout 60s, retries 1, trace on-failure, workers 1, channel 'chrome'.", effort: "M", hours: 10, deadline: "Sem 17", priority: "High", deps: ["T67"] },
    { id: "T69", milestone: "M7", status: "Done", name: "Estabilizar Vite build e resolver flakiness E2E", desc: "vite.config.ts atualizado com proxy /api para localhost:8000. Mock de Auth configurado ANTES do page.navigation. Dialog handles instalados (page.once('dialog')). Respostas API Mockedas corretamente para todas as schemas.", effort: "M", hours: 8, deadline: "Sem 17-18", priority: "High", deps: ["T68"] },

    // M7 — Infraestrutura de Agentes IA
    { id: "T70", milestone: "M7", status: "Done", name: "Criar infraestrutura de agentes IA (.agent/)", desc: "Criada estrutura completa em .agent/: agent-orchestrator (SKILL.md, file_locks.json, references/agent_registry.md + routing_rules.md + conflict_matrix.md, scripts/parse_kanban.py + build_dep_graph.py + lock_manager.py + generate_dispatch.py, workflows/analyze_and_prompt.md), engineering-design-agent (SKILL.md), software-qa-tester (SKILL.md), technical-doc-validator (SKILL.md + fix), translate-prompt-skill. Sistema de orquestração multi-agente com gerenciamento de conflitos de arquivo por file_locks.json.", effort: "L", hours: 20, deadline: "Sem 17", priority: "Medium", deps: ["T06"] },
  ],
};

const EFFORT_COLORS = { XS: "#10AC84", S: "#2E86DE", M: "#F7B731", L: "#E85D26", XL: "#FC5C65" };
const PRIORITY_COLORS = { High: "#FC5C65", Medium: "#F7B731", Low: "#10AC84" };
const COLUMNS = ["To Do", "In Progress", "Done"];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState(PROJECT_DATA.tasks);
  const [filterMilestone, setFilterMilestone] = useState("ALL");
  const [expandedTask, setExpandedTask] = useState(null);
  const [view, setView] = useState("kanban"); // kanban | timeline | risks

  const milestones = PROJECT_DATA.milestones;
  const milestoneMap = Object.fromEntries(milestones.map(m => [m.id, m]));

  const filteredTasks = useMemo(() => {
    if (filterMilestone === "ALL") return tasks;
    return tasks.filter(t => t.milestone === filterMilestone);
  }, [tasks, filterMilestone]);

  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const done = filteredTasks.filter(t => t.status === "Done").length;
    const inProg = filteredTasks.filter(t => t.status === "In Progress").length;
    const totalHours = filteredTasks.reduce((s, t) => s + t.hours, 0);
    const doneHours = filteredTasks.filter(t => t.status === "Done").reduce((s, t) => s + t.hours, 0);
    return { total, done, inProg, todo: total - done - inProg, totalHours, doneHours, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [filteredTasks]);

  const moveTask = (id, newStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const nextStatus = (status) => {
    if (status === "To Do") return "In Progress";
    if (status === "In Progress") return "Done";
    return "To Do";
  };

  const prevStatus = (status) => {
    if (status === "Done") return "In Progress";
    if (status === "In Progress") return "To Do";
    return "Done";
  };

  const risks = [
    { risk: "Complexidade normativa subestimada", impact: "Alto", mitigation: "Consultar engenheiro especialista em NBRs como revisor técnico durante o desenvolvimento dos motores de cálculo." },
    { risk: "Validação de cálculos incorreta", impact: "Crítico", mitigation: "Usar valores de referência de normas e manuais para testes. Comparar outputs com softwares comerciais existentes." },
    { risk: "Geração de PDF com formatação inconsistente", impact: "Médio", mitigation: "Investir em templates robustos desde o início. Testar com diferentes tamanhos de dados." },
    { risk: "Adoção lenta por engenheiros conservadores", impact: "Alto", mitigation: "Beta com engenheiros parceiros. Garantir que documentos gerados tenham qualidade igual ou superior ao manual." },
    { risk: "Escopo dos simuladores cresce indefinidamente", impact: "Alto", mitigation: "MVP com 2 simuladores (Carga Térmica + Aquecimento Solar). Demais simuladores em releases subsequentes." },
    { risk: "EnergyPlus: tempo de simulação em servidor", impact: "Alto", mitigation: "Docker otimizado, fila async (Celery/Redis), simulação máx 5 min. Cache de resultados para inputs idênticos. Sizing periods mais rápidos que annual." },
    { risk: "Biblioteca materiais BR incompleta ou imprecisa", impact: "Crítico", mitigation: "Validar contra publicações LabEEE/UFSC e NBR 15220-2. Consultar fabricantes para propriedades térmicas. Permitir input manual pelo engenheiro." },
    { risk: "Complexidade do INI-C para edifício de referência", impact: "Alto", mitigation: "Implementar INI-C como última fase (T51-T52). Consultar laboratórios de inspeção credenciados pelo INMETRO. Começar por tipologias simples." },
    { risk: "Vendor lock-in na plataforma de deploy", impact: "Médio", mitigation: "Arquitetura cloud-native com Docker + variáveis de ambiente. Migração documentada para Railway → DigitalOcean → AWS em menos de 2h (T65)." },
    { risk: "Custos de infraestrutura escalam com usuários", impact: "Médio", mitigation: "Começar com Railway (~R$50/mês). Monitorar custos. Migrar para DigitalOcean/AWS quando MRR > R$2k. Redis cache reduz carga no DB." },
  ],

  criticalPath = ["T01", "T02", "T05", "T07", "T08", "T13", "T20", "T21", "T25", "T26", "T33", "T67", "T68", "T69", "T54", "T55", "T56", "T57", "T58", "T63", "T38", "T39", "T42", "T44", "T45", "T47"];

  return (
    <div style={{ fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace", background: "#0A0E17", color: "#C8CDD5", minHeight: "100vh", padding: "0" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0D1321 0%, #151D2E 100%)", borderBottom: "1px solid #1E2A3A", padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10AC84", boxShadow: "0 0 8px #10AC84" }} />
              <span style={{ fontSize: 11, color: "#5A6A7A", letterSpacing: 2, textTransform: "uppercase" }}>Projeto 8 — thermes.com.br</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#E8ECF1", letterSpacing: -0.5 }}>
              Plataforma de ARTs & Laudos
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "#5A6A7A" }}>
              {stats.total} tarefas · ~{stats.totalHours}h estimadas · {stats.pct}% concluído
            </p>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["kanban", "timeline", "risks"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "6px 14px", fontSize: 11, border: "1px solid", cursor: "pointer",
                borderColor: view === v ? "#2E86DE" : "#1E2A3A",
                background: view === v ? "#2E86DE15" : "transparent",
                color: view === v ? "#2E86DE" : "#5A6A7A",
                borderRadius: 4, fontFamily: "inherit", textTransform: "capitalize"
              }}>{v === "kanban" ? "Kanban" : v === "timeline" ? "Timeline" : "Riscos"}</button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
          {[
            { label: "To Do", value: stats.todo, color: "#5A6A7A" },
            { label: "In Progress", value: stats.inProg, color: "#F7B731" },
            { label: "Done", value: stats.done, color: "#10AC84" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
              <span style={{ fontSize: 11, color: "#5A6A7A" }}>{s.label}:</span>
              <span style={{ fontSize: 13, color: "#E8ECF1", fontWeight: 600 }}>{s.value}</span>
            </div>
          ))}
          <div style={{ flex: 1, minWidth: 120, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 4, background: "#1E2A3A", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: `${stats.pct}%`, height: "100%", background: "linear-gradient(90deg, #10AC84, #2E86DE)", borderRadius: 2, transition: "width 0.5s ease" }} />
            </div>
            <span style={{ fontSize: 11, color: "#10AC84", fontWeight: 600 }}>{stats.pct}%</span>
          </div>
        </div>

        {/* Milestone filter */}
        <div style={{ display: "flex", gap: 4, marginTop: 12, flexWrap: "wrap" }}>
          <button onClick={() => setFilterMilestone("ALL")} style={{
            padding: "4px 10px", fontSize: 10, border: "1px solid",
            borderColor: filterMilestone === "ALL" ? "#C8CDD5" : "#1E2A3A",
            background: filterMilestone === "ALL" ? "#C8CDD510" : "transparent",
            color: filterMilestone === "ALL" ? "#E8ECF1" : "#5A6A7A",
            borderRadius: 3, cursor: "pointer", fontFamily: "inherit"
          }}>Todos</button>
          {milestones.map(m => (
            <button key={m.id} onClick={() => setFilterMilestone(m.id)} style={{
              padding: "4px 10px", fontSize: 10, border: "1px solid",
              borderColor: filterMilestone === m.id ? m.color : "#1E2A3A",
              background: filterMilestone === m.id ? m.color + "15" : "transparent",
              color: filterMilestone === m.id ? m.color : "#5A6A7A",
              borderRadius: 3, cursor: "pointer", fontFamily: "inherit"
            }}>{m.name}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 24px" }}>
        {view === "kanban" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, minHeight: 400 }}>
            {COLUMNS.map(col => {
              const colTasks = filteredTasks.filter(t => t.status === col);
              return (
                <div key={col} style={{ background: "#0D1321", border: "1px solid #1E2A3A", borderRadius: 6, padding: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, padding: "0 4px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: col === "Done" ? "#10AC84" : col === "In Progress" ? "#F7B731" : "#5A6A7A", textTransform: "uppercase", letterSpacing: 1.5 }}>{col}</span>
                    <span style={{ fontSize: 11, color: "#3A4A5A", background: "#151D2E", padding: "2px 8px", borderRadius: 10 }}>{colTasks.length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {colTasks.map(task => {
                      const ms = milestoneMap[task.milestone];
                      const isExpanded = expandedTask === task.id;
                      const isCritical = criticalPath.includes(task.id);
                      return (
                        <div key={task.id} onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                          style={{
                            background: "#151D2E", border: "1px solid", borderColor: isCritical ? ms.color + "60" : "#1E2A3A",
                            borderRadius: 5, padding: "10px 12px", cursor: "pointer",
                            borderLeft: `3px solid ${ms.color}`,
                            transition: "all 0.15s ease",
                          }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: "#E8ECF1", lineHeight: 1.3, flex: 1 }}>{task.name}</span>
                            <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: EFFORT_COLORS[task.effort] + "20", color: EFFORT_COLORS[task.effort], fontWeight: 700, whiteSpace: "nowrap" }}>{task.effort}</span>
                          </div>
                          <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
                            <span style={{ fontSize: 9, color: ms.color, background: ms.color + "15", padding: "1px 6px", borderRadius: 2 }}>{ms.name}</span>
                            <span style={{ fontSize: 9, color: "#5A6A7A" }}>{task.deadline}</span>
                            <span style={{ fontSize: 9, color: PRIORITY_COLORS[task.priority] }}>● {task.priority}</span>
                            {isCritical && <span style={{ fontSize: 8, color: "#FC5C65", background: "#FC5C6515", padding: "1px 5px", borderRadius: 2, fontWeight: 700 }}>CAMINHO CRÍTICO</span>}
                          </div>
                          {isExpanded && (
                            <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #1E2A3A" }}>
                              <p style={{ fontSize: 10, color: "#8A96A5", margin: "0 0 6px", lineHeight: 1.5 }}>{task.desc}</p>
                              <div style={{ fontSize: 9, color: "#5A6A7A", marginBottom: 6 }}>
                                <strong style={{ color: "#8A96A5" }}>Estimativa:</strong> ~{task.hours}h &nbsp;|&nbsp;
                                <strong style={{ color: "#8A96A5" }}>ID:</strong> {task.id}
                              </div>
                              {task.deps.length > 0 && (
                                <div style={{ fontSize: 9, color: "#5A6A7A" }}>
                                  <strong style={{ color: "#8A96A5" }}>Depende de:</strong>{" "}
                                  {task.deps.map(d => {
                                    const depTask = tasks.find(t => t.id === d);
                                    return <span key={d} style={{ color: depTask?.status === "Done" ? "#10AC84" : "#F7B731", marginRight: 4 }}>{d}{depTask?.status === "Done" ? " ✓" : ""}</span>;
                                  })}
                                </div>
                              )}
                              <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                                {task.status !== "To Do" && (
                                  <button onClick={(e) => { e.stopPropagation(); moveTask(task.id, prevStatus(task.status)); }}
                                    style={{ fontSize: 9, padding: "3px 10px", background: "#1E2A3A", border: "1px solid #2A3A4A", color: "#8A96A5", borderRadius: 3, cursor: "pointer", fontFamily: "inherit" }}>
                                    ← {prevStatus(task.status)}
                                  </button>
                                )}
                                {task.status !== "Done" && (
                                  <button onClick={(e) => { e.stopPropagation(); moveTask(task.id, nextStatus(task.status)); }}
                                    style={{ fontSize: 9, padding: "3px 10px", background: "#2E86DE20", border: "1px solid #2E86DE40", color: "#2E86DE", borderRadius: 3, cursor: "pointer", fontFamily: "inherit" }}>
                                    {nextStatus(task.status)} →
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === "timeline" && (
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 700 }}>
              {milestones.filter(m => filterMilestone === "ALL" || filterMilestone === m.id).map(ms => {
                const mTasks = filteredTasks.filter(t => t.milestone === ms.id);
                const done = mTasks.filter(t => t.status === "Done").length;
                const pct = mTasks.length ? Math.round((done / mTasks.length) * 100) : 0;
                return (
                  <div key={ms.id} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: ms.color }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#E8ECF1" }}>{ms.id}: {ms.name}</span>
                      <span style={{ fontSize: 10, color: "#5A6A7A" }}>{done}/{mTasks.length} tarefas</span>
                      <div style={{ width: 80, height: 3, background: "#1E2A3A", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: ms.color, borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 10, color: ms.color }}>{pct}%</span>
                    </div>
                    {mTasks.map(task => (
                      <div key={task.id} style={{ display: "grid", gridTemplateColumns: "50px 1fr 60px 70px 50px 80px", alignItems: "center", gap: 8, padding: "6px 12px", marginLeft: 18, borderLeft: `2px solid ${ms.color}30`, borderBottom: "1px solid #1E2A3A10", fontSize: 10 }}>
                        <span style={{ color: "#5A6A7A", fontWeight: 600 }}>{task.id}</span>
                        <span style={{ color: "#C8CDD5" }}>{task.name}</span>
                        <span style={{ color: EFFORT_COLORS[task.effort], fontWeight: 700 }}>{task.effort} ({task.hours}h)</span>
                        <span style={{ color: "#5A6A7A" }}>{task.deadline}</span>
                        <span style={{ color: PRIORITY_COLORS[task.priority] }}>●</span>
                        <span style={{
                          fontSize: 9, padding: "2px 8px", borderRadius: 3, textAlign: "center",
                          background: task.status === "Done" ? "#10AC8420" : task.status === "In Progress" ? "#F7B73120" : "#1E2A3A",
                          color: task.status === "Done" ? "#10AC84" : task.status === "In Progress" ? "#F7B731" : "#5A6A7A"
                        }}>{task.status}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === "risks" && (
          <div>
            <h3 style={{ fontSize: 14, color: "#E8ECF1", marginBottom: 12, fontWeight: 700 }}>Riscos & Caminho Crítico</h3>
            <div style={{ background: "#0D1321", border: "1px solid #1E2A3A", borderRadius: 6, padding: 16, marginBottom: 16 }}>
              <h4 style={{ fontSize: 11, color: "#FC5C65", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Caminho Crítico ({criticalPath.length} tarefas)</h4>
              <p style={{ fontSize: 10, color: "#5A6A7A", marginBottom: 10 }}>Sequência que determina a duração mínima do projeto. Atrasos aqui impactam o prazo final.</p>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                {criticalPath.map((tid, i) => {
                  const t = tasks.find(x => x.id === tid);
                  const ms = milestoneMap[t.milestone];
                  return (
                    <div key={tid} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 9, padding: "3px 8px", background: ms.color + "15", border: `1px solid ${ms.color}30`, color: ms.color, borderRadius: 3, fontWeight: 600 }}>{tid}</span>
                      {i < criticalPath.length - 1 && <span style={{ color: "#3A4A5A", fontSize: 10 }}>→</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {risks.map((r, i) => (
                <div key={i} style={{ background: "#0D1321", border: "1px solid #1E2A3A", borderRadius: 6, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#E8ECF1" }}>{r.risk}</span>
                    <span style={{
                      fontSize: 9, padding: "2px 8px", borderRadius: 3, fontWeight: 700,
                      background: r.impact === "Crítico" ? "#FC5C6520" : r.impact === "Alto" ? "#E85D2620" : "#F7B73120",
                      color: r.impact === "Crítico" ? "#FC5C65" : r.impact === "Alto" ? "#E85D26" : "#F7B731"
                    }}>{r.impact}</span>
                  </div>
                  <p style={{ fontSize: 10, color: "#8A96A5", margin: 0, lineHeight: 1.5 }}>
                    <strong style={{ color: "#C8CDD5" }}>Mitigação:</strong> {r.mitigation}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ background: "#0D1321", border: "1px solid #1E2A3A", borderRadius: 6, padding: 16, marginTop: 16 }}>
              <h4 style={{ fontSize: 11, color: "#2E86DE", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Trilhas Paralelas</h4>
              <div style={{ fontSize: 10, color: "#8A96A5", lineHeight: 1.8 }}>
                <div><strong style={{ color: "#E85D26" }}>Track A (Backend):</strong> T01 → T02 → T05 → T07 → T08/T09/T10/T11 → T13</div>
                <div><strong style={{ color: "#10AC84" }}>Track B (Frontend):</strong> T01 → T14 → T15/T16/T17 → T18 → T19</div>
                <div><strong style={{ color: "#8854D0" }}>Track C (Docs):</strong> T20 → T21/T22/T23 → T24 (inicia após T13)</div>
                <div><strong style={{ color: "#F7B731" }}>Track D (Revisão):</strong> T25 → T26/T27/T28 (paralelo a Track C)</div>
                <div><strong style={{ color: "#FC5C65" }}>Track E (SaaS):</strong> T29 → T30/T31/T32 (inicia Sem 14, paralelo a C/D)</div>
                <div><strong style={{ color: "#22C55E" }}>Track F (M8 - Deploy):</strong> T54 → T55/T56 → T57/T58 → T59/T60/T61 → T62 → T63 (Sem 17-18, pré-requisito para beta e EnergyPlus)</div>
                <div><strong style={{ color: "#0EA5E9" }}>Track G (M9 - EnergyPlus):</strong> T38 → T39/T40/T41 → T42 → T44/T45/T48/T49 → T46/T47/T50 → T51/T52 → T53 (inicia Sem 21, após soft launch)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
