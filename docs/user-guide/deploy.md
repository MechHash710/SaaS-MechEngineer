# Guia de Deploy (Onda 2)

Agora entramos na **Onda 2** (Sequencial) do seu Kanban para fechar o **M8 (Fase 1)**. Como as configurações dinâmicas de ambiente (CORS e Database) no backend foram injetadas e o `railway.toml` validado, o sistema já rodará limpo em Nuvem.  

Abaixo estão os passos manuais interativos de responsabilidade da gerência (PM) para estabilizar os domínios e criar os serviços:

## TAREFA 54 — Configurar Cloudflare

Esta etapa é crucial para que o SSL/TLS não encontre conflitos entre Vercel/Railway.

1. Acesse o [Cloudflare Dashboard](https://dash.cloudflare.com) e crie/acesse sua conta (Free Plan).
2. Adicione seu domínio, `thermes.com.br`.
3. Acesse o **Registro.br** e altere os *Nameservers* para as opções fornecidas pela Cloudflare (ex: `ns1.cloudflare.com`). **Atenção:** isso pode levar até 48h.
4. Na aba **SSL/TLS do Cloudflare**, ajuste a configuração para >> **Full (strict)**.
5. Crie uma **Page Rule**:
   - URL Match: `thermes.com.br/*`
   - Configuração: `Cache Level` = `Standard`

> [!WARNING]  
> Você só deve tentar acesso e teste completo do sistema **quando o cadeado verde do domínio (HTTPS)** estiver perfeitamente ativo via Cloudflare e os DNS apontarem para Vercel/Railway!

---

## TAREFA 57 — Deploy do Backend no Railway

O código (`main.py` e `config.py`) já está ajustado para processar suas restrições e o arquivo `railway.toml` está validado.

1. Acesse o seu [Dashboard no Railway](https://railway.app/).
2. Clique em **New Project** > **Deploy from GitHub repository** e selecione a branch `main`.
3. Com o projeto criado, clique em **Add Plugin** > adicione um **PostgreSQL**.
4. Copie a `DATABASE_URL` gerada pelo banco.  
5. Acesse as **Variables** (Variáveis de Ambiente) do serviço backend e adicione as chaves:
   - `DATABASE_URL` = *(Cole a URL do PostgreSQL copiada)*
   - `SECRET_KEY` = *(Gere e cole uma hash longa e segura)*
   - `STRIPE_SECRET_KEY` = *(Chave secreta de produção do Stripe para testes/compras)*
   - `CORS_ORIGINS` = `https://thermes.com.br,https://www.thermes.com.br`

> [!TIP]  
> Quando os builds terminarem, acesse URL do aplicativo (ex: `https://api.thermes.com.br/health`) pelo navegador ou `curl` e espere visualizar o JSON indicando o status saudável!

---

## TAREFA 58 — Deploy do Frontend no Vercel/Railway

A configuração recomendada para Single Page Apps que utilizam Vite varia superficialmente, mas o core é idêntico. Sugere-se Vercel pela velocidade de propagações e CDN ou utilizar os *Dockerfiles Otimizados*:

1. Acesse [Vercel](https://vercel.com/) (ou Railway se desejar concentrar tudo). 
2. Inicie o Deploy através do seu github (A pasta destino será o monorepo inteiro, mas você deve indicar a raiz do framework como `/frontend`).
3. Deixe o Vercel detectar as diretrizes (Vite JS). O Start Command será `npm run build` e Output: `dist`.
4. É obrigatória a configuração da variável de rede:
   - `VITE_API_URL` = `https://api.thermes.com.br`
5. Adicione seu domínio configurado `thermes.com.br` aos Custom Domains da respectiva plataforma para conectar seu app aos DNS.

*Depois que tudo estiver vivo e em verde, faça um cadastro usando a rede de testes original para validar o sistema End-to-End no ar!*
