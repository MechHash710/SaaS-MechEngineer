# DNS & Domínio — Guia Completo

## Conceitos Fundamentais

### Tipos de registro DNS

| Tipo | Uso | Exemplo |
|---|---|---|
| **A** | Aponta domínio para IP direto | `thermes.com.br → 185.230.63.186` |
| **CNAME** | Aponta subdomínio para outro domínio | `app → xyz.railway.app` |
| **TXT** | Verificação de propriedade, SPF, DKIM | `_railway-verify.app → railway-verify-xxx` |
| **MX** | Email (não mexa!) | `@ → aspmx.l.google.com` |
| **NS** | Nameservers (não mexa sem saber!) | `@ → ns1.wix.com` |

### Subdomínios recomendados para apps

```
thermes.com.br        → Landing page / site de marketing (Wix, Webflow)
www.thermes.com.br    → Alias do site principal (nunca aponte para o app!)
app.thermes.com.br    → Frontend da aplicação (Railway, Vercel)
api.thermes.com.br    → Backend/API (Railway)
cdn.thermes.com.br    → Assets estáticos (Cloudflare)
```

## Provedores Comuns e Como Configurar

### Wix
1. Configurações → Domínios → Gerenciar DNS
2. Role até **Registro CNAME (Aliases)**
3. Clique **+ Adicionar registro**
4. Preencha Nome e Valor
5. Para TXT: Role até **TXT (Texto)** → **+ Adicionar registro**

> ⚠️ **Wix pode levar até 48h** para propagar alterações DNS

### GoDaddy
1. Minha Conta → Domínios → DNS
2. Clique **Adicionar** no tipo correto

### Registro.br
1. Painel → Domínio → Configurar DNS
2. Adicione registros em "Adicionar Entrada"

## Verificar Propagação

Use estas ferramentas para checar se o DNS propagou:

```
https://www.whatsmydns.net/#CNAME/app.seudominio.com.br
https://dnschecker.org/#CNAME/app.seudominio.com.br
```

No terminal Windows:
```powershell
Resolve-DnsName app.seudominio.com.br
```

## Processo de Verificação de Domínio (Railway/Vercel/Netlify)

Plataformas modernas exigem dois registros antes de ativar HTTPS:

1. **CNAME** → direciona o tráfego
2. **TXT de verificação** → prova que você é o dono do domínio

A sequência correta é:
1. Adicionar o Custom Domain na plataforma
2. A plataforma mostra o CNAME e o TXT necessários
3. Adicionar **ambos** no seu provedor DNS
4. Aguardar propagação (15min - 48h)
5. A plataforma detecta e ativa o SSL automaticamente

## SSL/HTTPS

Todas as plataformas modernas (Railway, Vercel, Netlify, Cloudflare) geram certificados SSL **gratuitos** via Let's Encrypt automaticamente após a verificação do domínio.

> ❌ Nunca pague por SSL básico — é sempre gratuito em 2024+
