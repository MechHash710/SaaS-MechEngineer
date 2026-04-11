# Cloudflare Pages — Deploy Guide

Ideal para sites ultra-rápidos aproveitando a CDN global da Cloudflare.

## Quando usar Cloudflare Pages

- Sites estáticos ou SPA (React, Vue, Svelte)
- Projetos que já usam Cloudflare para DNS (é mais fácil integrar)
- Quando performance máxima de CDN é prioridade
- Junto com Cloudflare R2 para storage de arquivos

## Setup

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com) → **Pages → Create a project**
2. Conecte ao GitHub
3. Configure build:
   - **Build command**: `npm run build`
   - **Output directory**: `dist` ou `build`
4. Deploy

## Cloudflare R2 (Storage de Arquivos)

R2 é o storage de objetos da Cloudflare, compatível com S3. Gratuito até 10GB.

### Criar bucket
1. Dashboard → **R2 → Create bucket**
2. Nome do bucket: ex. `meuapp-pdfs`

### Credenciais para usar com boto3
1. **R2 → Manage R2 API Tokens → Create API Token**
2. Salve:
   - `Account ID` (na página principal do R2)
   - `Access Key ID`
   - `Secret Access Key`

### Configuração no Python (boto3)
```python
import boto3

s3 = boto3.client(
    "s3",
    endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
    aws_access_key_id=access_key_id,
    aws_secret_access_key=secret_access_key,
    region_name="auto",
)
```

### Variáveis de ambiente necessárias
```
R2_ACCOUNT_ID=sua_account_id
R2_ACCESS_KEY_ID=sua_key_id
R2_SECRET_ACCESS_KEY=sua_secret_key
R2_BUCKET_NAME=nome-do-bucket
```
