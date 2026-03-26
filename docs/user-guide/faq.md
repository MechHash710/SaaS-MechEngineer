# ❓ FAQ — Perguntas Frequentes

## Conta e Acesso

**Esqueci minha senha. Como recupero?**  
Clique em "Esqueci minha senha" na tela de login. Um link de recuperação será enviado para seu e-mail.

**Posso usar a plataforma sem criar conta?**  
Não. A conta é necessária para controlar as quotas do plano e salvar o histórico de simulações.

---

## Planos e Billing

**O que acontece quando atinjo o limite do plano Free?**  
As simulações são bloqueadas e a API retorna HTTP 403. Você pode fazer upgrade em **Configurações → Plano**.

**Posso cancelar o plano Pro a qualquer momento?**  
Sim. Acesse o **Portal de Cobrança Stripe** em **Configurações → Gerenciar Assinatura** e cancele. O plano Free é restaurado ao final do ciclo de cobrança atual.

**Os pagamentos são seguros?**  
Sim. Todos os pagamentos são processados pelo **Stripe** com criptografia PCI-DSS. Não armazenamos dados de cartão.

---

## Simuladores

**Os cálculos seguem normas ABNT?**  
Sim. O simulador HVAC segue a **ABNT NBR 16401-1** e o Solar segue a **ABNT NBR 15569**. Cada passo de cálculo cita a norma e o artigo correspondente.

**Posso confiar nos resultados para emitir uma ART?**  
A plataforma é uma **ferramenta de apoio**. A responsabilidade técnica pela ART é sempre do engenheiro registrado no CREA. Revise todos os resultados antes de assinar.

**Por que o resultado varia para a mesma cidade?**  
A irradiação solar (GHI) é obtida em tempo real via Open-Meteo com dados históricos do ERA5. Variações de até 3% são normais entre dias diferentes.

**O Simulador HVAC considera pontes térmicas?**  
Parcialmente. O fator de segurança de +10% no cálculo compensa cargas não modeladas, incluindo pontes térmicas, infiltração e envelhecimento do equipamento.

---

## Documentos / PDFs

**Posso editar os PDFs gerados?**  
Os PDFs são gerados como documentos fechados. Se precisar alterar dados, refaça a simulação com os valores corretos e gere um novo PDF.

**O PDF inclui assinatura digital?**  
Não nesta versão. O campo de CREA está incluso no documento, mas a assinatura digital deverá ser adicionada com ferramenta de assinatura eletrônica (ex: Docusign, Adobe Sign).

---

## Problemas Técnicos

**A simulação retornou erro de "quota atingida" mesmo no início do mês.**  
Verifique se seu plano está ativo em **Configurações → Assinatura**. Se o Stripe não confirmou o último pagamento, o plano pode ter sido revertido para Free.

**A geração de PDF está demorando muito.**  
O primeiro PDF do dia pode demorar até 3 segundos enquanto o servidor aquece o cache de templates. Tentativas subsequentes são mais rápidas.
