# Simulador de Ventilação

Dimensiona a vazão de ar externo e o sistema de dutos para ambientes comerciais e residenciais, conforme **ABNT NBR 16401-3** e **ASHRAE Standard 62.1**.

---

## O que este simulador calcula

| Resultado | Descrição | Unidade |
|---|---|---|
| Vazão por ocupação | Ar fresco baseado no número de pessoas | L/s |
| Vazão por área | Ar fresco baseado na área do ambiente | L/s |
| Vazão total | Soma das vazões + folga de segurança | m³/h |
| Diâmetro equivalente do duto | Seção circular recomendada | mm |
| ACH (Air Changes per Hour) | Renovações de ar por hora | 1/h |

---

## Campos do formulário

| Campo | Unidade | Valor típico | Obrigatório |
|---|---|---|---|
| Área do Ambiente | m² | 20–5.000 | Sim |
| Pé-direito | m | 2,40–6,00 | Sim |
| Número de Ocupantes | pessoas | 1–500 | Sim |
| Tipo de Ambiente | — | Escritório / Auditório / Sala de Aula / Loja | Sim |

### Tipos de ambiente disponíveis

| Tipo | Taxa ASHRAE 62.1 (Tabela 6-1) |
|---|---|
| Escritório Geral | 10 CFM/pessoa + 0,06 CFM/ft² |
| Auditório / Cinema | 15 CFM/pessoa |
| Sala de Aula | 15 CFM/pessoa + 0,12 CFM/ft² |
| Loja de Varejo / Shopping | 8,5 CFM/pessoa + 0,06 CFM/ft² |

---

## Metodologia de cálculo

O cálculo segue o **Método de Ventilação por Zona** da ASHRAE 62.1:

```
Q_pessoas [L/s] = Nº_ocupantes × taxa_pessoa
Q_area    [L/s] = Área_m² × taxa_area
Q_total   [L/s] = Q_pessoas + Q_area
Q_total   [m³/h] = Q_total [L/s] × 3,6

Diâmetro equivalente [mm]:
  A_duto [m²] = Q_total [m³/s] / V_ar [m/s]     (V_ar = 3,0 m/s padrão)
  Ø_eq [mm]   = √(4 × A_duto / π) × 1000

ACH [1/h] = Q_total [m³/h] / Volume_ambiente [m³]
```

---

## Interpretando os resultados

**Vazão total (m³/h)**: Quanto maior o número de pessoas e a área, maior a vazão necessária. Um escritório de 40 m² com 10 pessoas deve ter aproximadamente 170 m³/h (ASHRAE 62.1).

**Diâmetro do duto**: Valor calculado para velocidade de 3,0 m/s no duto principal. Para dutos ramificados, reduza a velocidade para 1,5–2,5 m/s.

**ACH**: Valores recomendados por tipo de uso:
- Escritórios: 6–10 ACH
- Salas de cirurgia / labs: 15–20 ACH
- Residencial: 0,35 ACH (mínimo ASHRAE)

---

## Normas aplicadas

- **ABNT NBR 16401-3:2008** — Instalações de ar-condicionado: Qualidade do Ar Interior
- **ASHRAE Standard 62.1:2022** — Ventilation and Acceptable Indoor Air Quality in Residential Buildings
- **ASHRAE Fundamentals 2021** — Capítulo 16 (Ventilation and Infiltration)

---

## Como gerar o PDF após o cálculo

1. Preencha o formulário e clique em **Calcular**
2. Após o resultado aparecer, clique em **Baixar Memorial PDF**
3. O memorial inclui: parâmetros de entrada, passos do cálculo, normas aplicadas e recomendação de duto

O PDF é gerado com assinatura digital opcional (informe CREA e nome na aba de configurações).
