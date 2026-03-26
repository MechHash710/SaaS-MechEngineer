# 🚀 Checklist de Soft Launch — Beta Fechado

Este documento guia o processo de lançamento beta da plataforma.

## Pré-requisitos para o Launch

### Infraestrutura ✅
- [x] Servidor VPS configurado com Docker Compose (`docker-compose.prod.yml`)
- [x] Banco de dados PostgreSQL com backup automático
- [x] CI/CD pipeline GitHub Actions configurado (build + deploy + smoke test)
- [x] Endpoint `/health` respondendo `"status": "ok"`
- [x] SSL/TLS configurado via nginx (wildcard ou domínio específico)

### Produto ✅
- [x] 5 Simuladores funcionando com normas ABNT/ASHRAE
- [x] Pipeline de PDF completo (4 tipos de documento)
- [x] Sistema de auth JWT com registro, login e refresh
- [x] Billing Stripe com planos Free, Pro e Business
- [x] Controle de quotas por plano
- [x] E2E tests passando (Playwright)
- [x] Performance testada (Locust) — P95 < 100ms simulações

### Feedback & Beta ✅
- [x] Página pública de cadastro beta: `/?mode=beta`
- [x] Widget de feedback in-app com 5 estrelas + categoria + mensagem
- [x] Endpoints de coleta: `POST /api/v1/feedback/submit` e `/beta_invite`
- [x] Painel admin: `GET /api/v1/feedback/admin/feedbacks` + `/stats`

---

## Roteiro de Lançamento

### Semana 1 — Convite Fechado (10–20 engenheiros)
1. **Configurar** URL pública da plataforma (ex: `app.engenharia.io`)
2. **Compartilhar** link da página beta `/?mode=beta` por e-mail/WhatsApp
3. **Monitorar** logs de registro em `GET /api/v1/feedback/admin/beta_invites`
4. **Aprovar** manualmente os primeiros 10–20 usuários (criar contas através da API)

### Semana 2 — Monitoramento
1. Verificar feedbacks diariamente: `GET /api/v1/feedback/admin/stats`
2. Analisar bugs com prioridade (categoria: `bug`)
3. Corrigir issues críticos em < 48h

### Semana 3 — Iteração
1. Consolidar sugestões recorrentes
2. Implementar quick-wins (melhorias rápidas)
3. Coletar NPS via entrevista com 3–5 usuários

### Semana 4 — Decisão
1. Analisar métricas: taxa de retorno, simulações por usuário, PDFs gerados
2. Decidir: lançamento público ou mais uma rodada beta
3. Preparar release notes para v1.0 público

---

## Métricas de Sucesso

| Métrica | Meta |
| :--- | :--- |
| Usuários beta ativos (semana 1) | ≥ 10 |
| Rating médio de feedback | ≥ 4.0 / 5.0 |
| Simulações por usuário / semana | ≥ 3 |
| PDFs gerados por usuário / semana | ≥ 1 |
| Bugs críticos reportados | ≤ 2 |
| Taxa de retorno (semana 2) | ≥ 60% |

---

## Comunicação com Usuários Beta

### Template de E-mail de Boas-vindas

```
Assunto: Você está dentro! 🎉 Acesso Beta — Plataforma de Simulação

Olá [Nome],

Seja bem-vindo(a) ao beta fechado da Plataforma de Simulação de Engenharia Térmica!

Seu acesso já está liberado:
🔗 URL: https://app.engenharia.io
📧 Usuário: [email]
🔑 Senha temporária: [senha]

Itens incluídos no seu acesso Beta Pro (3 meses):
- Simuladores de HVAC, Solar, Ventilação e Eficiência Energética
- Geração ilimitada de PDFs (Memorial, Laudo, Relatório)
- Controle de Projetos e histórico

Feedback é ouro — use o botão 💬 na plataforma a qualquer momento.

Att,
Equipe da Plataforma
```

---

## Contatos de Emergência

| Situação | Ação |
| :--- | :--- |
| API retorna 500 | Verificar logs: `docker compose logs backend -f` |
| DB inacessível | Verificar health: `curl /health` |
| Stripe não processa pagamento | Testar webhook no Stripe Dashboard |
| Performance degradada | Reiniciar containers: `docker compose restart` |
