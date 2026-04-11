# Railway — Deploy Guide

Railway é a plataforma ideal para aplicações fullstack que precisam de backend + banco de dados com custo baixo e zero configuração de servidor.

## Quando usar Railway

- Backend Python (FastAPI, Django, Flask)
- Backend Node (Express, NestJS)
- Fullstack com PostgreSQL
- Qualquer app que precise de processos persistentes

## Setup Inicial

### 1. Criar conta e projeto
1. Acesse [railway.app](https://railway.app) e faça login com GitHub
2. Clique em **New Project → Deploy from GitHub repo**
3. Selecione o repositório

### 2. Configurar Root Directory (CRÍTICO)
Se seu repositório é um monorepo (frontend + backend na mesma pasta):
- Clique no serviço → **Settings → Source → Root Directory**
- Backend: `/backend_api` (ou o nome da sua pasta)
- Frontend: `/frontend`

### 3. Variáveis de Ambiente
Vá em **Variables** e adicione:
```
DATABASE_URL=<gerado automaticamente pelo PostgreSQL do Railway>
SECRET_KEY=<string aleatória longa>
CORS_ORIGINS=https://app.seudominio.com.br
ENVIRONMENT=production
```

### 4. Dockerfile Path
- Deixe em **branco** se o arquivo se chama `Dockerfile`
- O Railway procura `Dockerfile` automaticamente na Root Directory
- ⚠️ **Nunca deixe `Dockerfile.prod`** no campo Dockerfile Path se o arquivo foi renomeado

## Configurar Domínio Customizado

1. **Settings → Networking → Custom Domain**
2. Digite: `api.seudominio.com.br`
3. Railway mostrará dois registros para adicionar no seu DNS:
   - `CNAME api → xxx.up.railway.app`
   - `TXT _railway-verify.api → railway-verify-xxx...`
4. Adicione os dois no painel de DNS do seu provedor (Wix, GoDaddy, etc.)
5. Aguarde 15min-48h para propagação

## Armadilhas Comuns no Railway

### Porta dinâmica
```python
# ❌ Errado — porta hardcoded
CMD ["gunicorn", "main:app", "--bind", "0.0.0.0:8000"]

# ✅ Correto — Railway injeta a porta via $PORT
CMD sh -c "gunicorn main:app --bind 0.0.0.0:${PORT:-8000}"
```

### pydantic-settings rejeitando variáveis
```python
# ✅ Adicione extra="ignore" para Railway não derrubar o app
class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")
```

### DATABASE_URL do Railway com postgres:// vs postgresql://
```python
# SQLAlchemy 2.x precisa de postgresql://
db_url = os.environ.get("DATABASE_URL", "sqlite:///./dev.db")
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)
```

## Verificar se está funcionando

```bash
# Testar health check
curl https://api.seudominio.com.br/health

# Verificar DNS propagação
# Acesse: https://www.whatsmydns.net/#CNAME/api.seudominio.com.br
```
