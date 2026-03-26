# 💳 Billing API (Stripe)

**Prefixo:** `/api/v1/billing`  
**🔒 Todos requerem:** `Authorization: Bearer <access_token>` (exceto `/webhook`)

---

## POST /create_checkout_session

Cria uma sessão de pagamento no Stripe para upgrade de plano.

**Body:**
```json
{ "plan": "pro" }
```
> `plan`: `"pro"` | `"business"`

**Response 200:**
```json
{ "checkout_url": "https://checkout.stripe.com/pay/cs_..." }
```

Redirecione o usuário para `checkout_url` para completar o pagamento.

---

## GET /portal

Retorna a URL do **Billing Portal** do Stripe para o usuário gerenciar sua assinatura (alterar método de pagamento, cancelar, etc.).

**Response 200:**
```json
{ "portal_url": "https://billing.stripe.com/session/..." }
```

---

## GET /subscription

Retorna o status da assinatura atual do usuário.

**Response 200:**
```json
{
  "plan": "pro",
  "expires_at": "2026-04-16T00:00:00",
  "subscription_id": "sub_xxxxx",
  "is_active": true
}
```

---

## POST /cancel

Cancela a assinatura Stripe imediatamente e reverte o plano para `"free"`.

**Response 200:**
```json
{ "status": "success", "message": "Subscription cancelled" }
```

---

## POST /webhook

Endpoint que o Stripe chama para notificar eventos (pagamentos, cancelamentos).  
**⚠️ Não requer Bearer Token** — valida a assinatura via `Stripe-Signature` header.

Eventos processados:
- `checkout.session.completed` → Ativa o plano do usuário
- `customer.subscription.deleted` → Reverte para plano free
- `invoice.payment_failed` → Log de falha

---

## Planos

| Plano | Simulações/mês | PDFs/mês | Preço |
| :--- | :--- | :--- | :--- |
| **Free** | 5 | 2 | Gratuito |
| **Pro** | 50 | 20 | R$ 79/mês |
| **Business** | Ilimitado | Ilimitado | R$ 199/mês |
