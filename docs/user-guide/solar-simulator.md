# ☀️ Solar Simulator Guide

## O que o Simulador Calcula

O **Simulador de Aquecimento Solar** dimensiona sistemas de Aquecimento de Água Quente Sanitária (AQS) por energia solar, com base na **ABNT NBR 15569**.

O sistema calcula:
- Volume diário necessário e volume do boiler
- Área de coletores solares e quantidade de placas
- Fração solar efetiva (% da demanda atendida pelo sol)
- Economia mensal em kWh e anual em R$

---

## Campos do Formulário

| Campo | Descrição | Exemplo |
| :--- | :--- | :--- |
| `Localização` | Cidade/Estado para buscar GHI real | `Fortaleza, CE` |
| `Ocupantes` | Número de pessoas que usam AQS | `4` |
| `Consumo/pessoa (L/dia)` | Consumo médio (NBR: 50 L/pessoa/dia) | `50` |
| `T. Fria (°C)` | Temperatura da água da rede | `20` |
| `T. Quente (°C)` | Temperatura final desejada | `45` |
| `Tipo de Sistema` | Termossifão ou Forçada | `circulacao_natural` |
| `Tipo de Coletor` | Plano (vidro/cobre) ou Tubo a Vácuo | `plano` |
| `Orientação do Telhado` | Norte é ideal para o hemisfério sul | `Norte` |
| `Inclinação (°)` | Inclinação do telhado | `22` |

---

## Metodologia

```
E_dia = m × c × ΔT / 859.8    (kWh/dia necessário)
A_min = (E_dia × fs) / (GHI × η)  (m² de coletores)
```

Onde:
- `m` = massa d'água (L × 1 kg/L)
- `ΔT` = T_quente - T_fria
- `GHI` = Irradiação Solar Global (kWh/m²/dia) via Open-Meteo
- `η` = Eficiência do coletor (50% plano, 65% vácuo)
- `fs` = Fração Solar Alvo (75%)

---

## Interpretando os Resultados

- **Fração Solar ≥ 75%:** sistema bem dimensionado para a meta
- **Economia Anual (R$):** baseada em tarifa média de R$ 0,95/kWh
- Um fator de 20% é adicionado ao volume do boiler (margem de segurança NBR)

> Sistemas em orientação diferente de Norte têm ~15% de perda de eficiência incorporada.

---

## Cidades com Alto Potencial Solar

| Cidade | GHI (kWh/m²/dia) | Potencial |
| :--- | :--- | :--- |
| Fortaleza, CE | ~6.2 | ⭐⭐⭐⭐⭐ |
| Cuiabá, MT | ~5.8 | ⭐⭐⭐⭐⭐ |
| Petrolina, PE | ~6.0 | ⭐⭐⭐⭐⭐ |
| São Paulo, SP | ~4.8 | ⭐⭐⭐⭐ |
| Porto Alegre, RS | ~4.2 | ⭐⭐⭐ |
