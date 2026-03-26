# 🚀 Guia de Deploy em Produção

Este guia descreve como fazer o deploy da plataforma em um VPS Linux usando Docker Compose.

## Pré-requisitos do Servidor

| Item | Requisito mínimo |
| :--- | :--- |
| OS | Ubuntu 22.04 LTS ou Debian 12 |
| RAM | 2 GB (recomendado: 4 GB) |
| CPU | 2 vCPUs |
| Disco | 20 GB SSD |
| Docker | 24+ |
| Docker Compose | V2 (plugin) |
| Portas abertas | 80 (HTTP), 443 (HTTPS), 22 (SSH gerencial) |

---

## 1. Preparar o Servidor

```bash
# Instala Docker + Docker Compose em Ubuntu 22.04
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Cria pasta da aplicação
sudo mkdir -p /opt/platform
sudo chown $USER:$USER /opt/platform
```

---

## 2. Clonar e Configurar

```bash
cd /opt/platform
git clone https://github.com/your-org/test-agent.git .

# Criar arquivo de variáveis de ambiente
cp backend_api/.env.example backend_api/.env.prod
nano backend_api/.env.prod
```

**Preencha no `.env.prod`:**

```env
DATABASE_URL=postgresql://pguser:pgpassword@db:5432/platform_prod
SECRET_KEY=<gere_com: openssl rand -hex 32>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_BUSINESS=price_yyy
```

---

## 3. Fazer Deploy

```bash
cd /opt/platform

# Build das imagens de produção
docker compose -f docker-compose.prod.yml build

# Aplicar migrações do banco de dados
docker compose -f docker-compose.prod.yml run --rm backend alembic upgrade head

# Subir todos os serviços
docker compose -f docker-compose.prod.yml up -d

# Verificar se está saudável
curl http://localhost/api/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "db": "connected",
  "version": "1.0.0",
  "timestamp": "2026-03-16T00:00:00Z"
}
```

---

## 4. Atualizar para uma Nova Versão

```bash
cd /opt/platform
git pull
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --remove-orphans
docker system prune -f
```

---

## 5. Deploy Automático via GitHub Actions

O workflow `.github/workflows/docker-build.yml` realiza deploy automático em **push para `main`**:

1. Faz build dos containers com `Dockerfile.prod`
2. Publica imagens no **GitHub Container Registry (GHCR)**
3. Conecta ao servidor via SSH e faz `docker compose pull` + `up -d`
4. Executa smoke test no endpoint `/api/health`

**Secrets necessários no GitHub:**

| Secret | Descrição |
| :--- | :--- |
| `DEPLOY_HOST` | IP ou domínio do servidor |
| `DEPLOY_USER` | Usuário SSH (ex: `ubuntu`) |
| `DEPLOY_SSH_KEY` | Chave privada SSH (formato PEM) |

---

## 6. Monitoramento

```bash
# Logs em tempo real
docker compose -f docker-compose.prod.yml logs -f backend

# Status dos containers
docker compose -f docker-compose.prod.yml ps

# Uso de recursos
docker stats
```

---

## 7. Backup do Banco de Dados

```bash
# Backup manual
docker compose -f docker-compose.prod.yml exec db \
  pg_dump -U pguser platform_prod | gzip > backup_$(date +%Y%m%d).sql.gz

# Restaurar
gunzip -c backup_20260316.sql.gz | docker compose -f docker-compose.prod.yml exec -T db \
  psql -U pguser platform_prod
```
