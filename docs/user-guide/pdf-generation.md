# 📄 Gerando e Baixando PDFs

## PDFs Disponíveis

| Documento | Conteúdo | Endpoint |
| :--- | :--- | :--- |
| **Memorial de Cálculo** | Todas as etapas de cálculo com normas | `/documents/memorial/{hvac\|solar}` |
| **Laudo Técnico** | Documento oficial com conclusão técnica | `/documents/laudo/{hvac\|solar}` |
| **Especificação de Equipamentos** | BOM + orçamento parametrizado | `/documents/especificacao` |
| **Relatório Completo** | Todos os documentos em um PDF único | `/documents/relatorio_completo` |

---

## Como Gerar um PDF pela Interface

1. Execute uma simulação (HVAC ou Solar)
2. Na aba de **Resultados**, localize a seção **Documentos**
3. Preencha o campo **Seu CREA** (ex: `12345/D-SP`)
4. Clique no botão correspondente ao documento desejado
5. O download inicia automaticamente

> ⚠️ O plano **Free** permite apenas **2 downloads de PDF por mês**.  
> Faça upgrade para Pro (20 PDFs) ou Business (ilimitado) em **Configurações → Plano**.

---

## Estrutura do Relatório Completo

```
Relatório Técnico Completo
├── Capa (projeto, engenheiro, CREA, data)
├── Seção 1 — Memorial de Cálculo
│   ├── Premissas e Constantantes Normativas
│   ├── Passo a Passo de Cálculo
│   └── Resultado Final (BTU/h, Equipamento)
├── Seção 2 — Laudo Técnico
│   ├── Descrição do Sistema
│   └── Conclusão e Assinatura
└── Rodapé com número de página e normas de referência
```

---

## Personalizando os Dados do Engenheiro

Os documentos PDF incluem automaticamente:
- **Nome do Engenheiro** — da conta do usuário
- **N° CREA** — informado no formulário de geração
- **Data de emissão** — gerada automaticamente

---

## Dica de Qualidade

Antes de gerar o PDF final, revise:
1. A seção **Passo a Passo** nos resultados — confirme que os cálculos fazem sentido
2. Os **Alertas de Validação** (warnings/critical) — resolva os issues antes de emitir
3. A **Fração Solar** no simulador solar — deve ser ≥ 70% para um bom projeto
