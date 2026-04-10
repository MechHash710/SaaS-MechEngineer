# 🚀 Guia Passo a Passo: Primeiro Deploy na Nuvem (Iniciantes)

Parabéns por chegar até aqui! O "Deploy" (implantar ou colocar no ar) significa tirar o projeto do seu computador e colocá-lo em servidores na internet para que qualquer pessoa consiga acessar o seu site (como o `thermes.com.br`).

Este guia foi desenhado para **pessoas sem qualquer experiência prévia** com servidores ou infraestrutura cloud. Nós utilizaremos o **Railway**, que é muito amigável para iniciantes.

---

## 🧭 Etapa 1: Criando as Contas Necessárias

Antes de tudo, você precisará de 3 contas gratuitas:
1. **GitHub**: Onde o seu código-fonte fica guardado na nuvem.
2. **Railway** (railway.app): A plataforma de hospedagem onde o código vai rodar.
3. **Cloudflare**: O serviço que vai conectar o nome `thermes.com.br` ao servidor do Railway e fornecer segurança e SSL (o cadeado verde).

**O que fazer agora:** Crie uma conta no [GitHub](https://github.com/), no [Railway](https://railway.app/) (você pode fazer login no Railway usando sua própria conta do GitHub) e no [Cloudflare](https://www.cloudflare.com/pt-br/).

---

## 📦 Etapa 2: Subindo o Código para o GitHub

O Railway precisa puxar o código de algum lugar. O padrão da indústria é usar o GitHub.

1. Abra o [GitHub](https://github.com) logado na sua conta.
2. Clique no botão verde **"New"** (Novo repositório) no canto superior.
3. Dê o nome de `engenharia-pro`, marque como **"Private"** (para proteger seu código comercial) e clique em **"Create repository"**.
4. No seu computador, abra o terminal (linha de comando) exatamente na pasta principal do seu projeto e digite os seguintes comandos um por vez, apertando ENTER após cada um *(se já fez isso, apenas faça o comando de envio)*:
   ```bash
   git add .
   git commit -m "Preparando para o primeiro deploy"
   git push origin main
   ```
   *(Substitua a URL do repositório remoto conforme o GitHub mostrar).*

---

## 🚂 Etapa 3: Publicando no Railway

Agora vamos dizer para o Railway ligar as "máquinas" (Docker) para rodar o nosso código. O projeto foi projetado como um "Monorepo" (Backend e Frontend na mesma pasta), então vamos criar dois serviços no Railway.

### 3.1 Backend (A API Python)
1. Vá no painel do **Railway** e clique em **"New Project"**.
2. Selecione **"Deploy from GitHub repo"** e escolha o repositório `engenharia-pro` que você acabou de criar.
3. O Railway vai tentar adivinhar como rodar o projeto, mas como é um monorepo, precisamos ajustar. Clique no card gerado e vá em **Settings**.
4. Na aba **General**, na seção *Root Directory*, digite: `/backend_api` (Isso avisa o Railway que o backend está nesta pasta).
5. Na aba **Variables**, adicione as seguintes variáveis de ambiente (são as chaves do seu banco de dados):
   - `ENVIRONMENT`: `production`
   - `CORS_ORIGINS`: `https://thermes.com.br,https://www.thermes.com.br`

### 3.2 O Banco de Dados
1. Na tela principal do seu projeto no Railway, clique novamente no botão **"New"** (Novo serviço).
2. Escolha **"Database"** e depois **"Add PostgreSQL"**.
3. O Railway vai criar um banco de dados automaticamente! 
4. Clique no seu serviço de **Backend**, vá na aba **Variables**, clique em "Add Variable" e procure por `DATABASE_URL`. O Railway preencherá automaticamente com o link do seu novo banco de dados!

### 3.3 Frontend (O Site React/Vite)
1. Novamente na tela do Railway, clique em **"New"** -> **"Deploy from GitHub repo"** e escolha o repositório `engenharia-pro` (sim, duas vezes, uma para o back, uma para o front).
2. Vá em **Settings** deste novo serviço. Em *Root Directory*, digite: `/frontend`.
3. Na aba **Variables**, você precisa apontar o front para o back. Crie a variável: `VITE_API_URL` com o valor do link público que o Railway gerou para o seu Backend.

---

## 🌐 Etapa 4: Configurando o Cloudflare (O Domínio)

Você já deve ter comprado o domínio `thermes.com.br` no Registro.br. 

1. Acesse o **Cloudflare** e clique em **"Add Site"**.
2. Digite `thermes.com.br` e escolha o plano **Free** (grátis).
3. O Cloudflare vai te dar **dois endereços de Nameservers** (ex: `carl.ns.cloudflare.com`).
4. Vá no painel do **Registro.br**, clique no seu domínio, role até a parte de "DNS", e cole os dois Nameservers informados pelo Cloudflare.
5. Volte no **Cloudflare**, vá na seção de **DNS**.
6. Aqui vem o truque: você precisa criar uma entrada apontando para os links do Railway.
   - Crie um "Registro CNAME" com Nome `@` e Destino "A URL pública do FRONTEND fornecido pelo Railway".
   - Crie outro "Registro CNAME" com Nome `api` e Destino "A URL pública do BACKEND fornecido pelo Railway".

---

## 🎉 Etapa 5: Teste Final!

Aguarde cerca de 10 a 30 minutos (a internet demora um pouco para propagar o nome do site novo).

Então digite `https://thermes.com.br` no seu navegador!
- Tente criar uma nova conta.
- Faça o login.
- Rode uma simulação rápida de Carga Térmica.

**Se tudo rodar sem erros:** Parabéns! Você acabou de realizar o seu primeiro deploy profissional em nuvem e sua plataforma está **oficialmente no ar**.

> [!TIP]
> **Dúvidas?** Não se desespere. O processo de deploy tem muitas "letrinhas miúdas". Se algum serviço falhar no Railway (um ícone vermelho), clique nele e leia a aba **"Deploy Logs"** — ela dirá exatamente se esqueceu de uma variável ou se ocorreu um erro no código.
