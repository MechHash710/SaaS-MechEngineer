# Vercel — Deploy Guide

Vercel é a melhor escolha para frontends modernos (Next.js, React, Vue, Svelte) e sites estáticos.

## Quando usar Vercel

- Next.js (melhor integração possível)
- React SPA (Vite, CRA)
- Sites estáticos (HTML/CSS puro)
- JAMstack com API routes simples

## Setup em 3 minutos

1. Acesse [vercel.com](https://vercel.com) → Login com GitHub
2. **Add New → Project → Import Git Repository**
3. Selecione o repo
4. Configure:
   - **Framework Preset**: Vercel detecta automaticamente (Next.js, Vite, etc.)
   - **Root Directory**: `/frontend` se for monorepo
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `dist` (Vite) ou `.next` (Next.js)
5. Clique **Deploy**

## Variáveis de Ambiente

Em **Settings → Environment Variables**:
```
VITE_API_URL=https://api.seudominio.com.br
NEXT_PUBLIC_API_URL=https://api.seudominio.com.br
```

> ℹ️ Variáveis prefixadas com `VITE_` ou `NEXT_PUBLIC_` são expostas ao browser

## Domínio Customizado

1. **Settings → Domains → Add**
2. Digite `app.seudominio.com.br`
3. Vercel mostrará o CNAME para adicionar:
   - `CNAME app → cname.vercel-dns.com`
4. (Opcional) TXT de verificação se Vercel pedir

## Deploy Automático

Vercel faz re-deploy automático em qualquer push para `main`. Para controlar:
- **Production branch**: `main`
- **Preview branches**: qualquer outra branch gera um link de preview
