# 🌡️ HVAC Simulator Guide

## O que o Simulador Calcula

O **Simulador de Carga Térmica HVAC** implementa o método prescritivo da **ABNT NBR 16401-1** para determinar a capacidade de refrigeração necessária para climatizar um ambiente.

A carga total é composta por:

| Componente | Fonte Normativa |
| :--- | :--- |
| Carga do Envelope (paredes/teto/janelas) | NBR 16401 + GHI Local via Open-Meteo |
| Carga de Ocupantes (sensível + latente) | ASHRAE Fundamentals 2021, Cap. 18 |
| Carga de Iluminação (10 W/m²) | NBR 16401-1, Tabela 2 |
| Carga de Equipamentos (W × 3.41 BTU/h) | NIST SP 811 |
| Fator de Segurança (+10%) | Auditoria de engenharia |

> **Nota sobre Atualização ASHRAE 2021:**
> O motor de cálculo foi recentemente atualizado para refletir as tabelas de calor latente/sensível por ocupante da *ASHRAE Fundamentals 2021*. Essa correção ajusta a proporção de dissipação de calor humano de acordo com as diretrizes climáticas tropicais mais recentes, melhorando a precisão em ambientes muito adensados.

---

## Campos do Formulário

| Campo | Descrição | Exemplo |
| :--- | :--- | :--- |
| `Área (m²)` | Área total do ambiente | `50` |
| `Pé-Direito (m)` | Altura do teto | `3.0` |
| `Ocupantes` | Número de pessoas | `10` |
| `Equipamentos` | Quantidade de equipamentos elétricos | `5` |
| `Potência (W/equip.)` | Watts por equipamento | `100` |
| `Exposição Solar` | Fachada predominante exposta | `tardes` |
| `Localização` | Cidade/Estado para GHI real | `São Paulo, SP` |

---

## Interpretando o Resultado

```
Total BTU/h = Σ(cargas) × (1 + Fator_Segurança)
```

### Equipamento Sugerido

| BTU calculado | Equipamento |
| :--- | :--- |
| ≤ 9.000 BTU/h | Split 9.000 BTU/h |
| ≤ 12.000 BTU/h | Split 12.000 BTU/h |
| ≤ 18.000 BTU/h | Split 18.000 BTU/h |
| ≤ 24.000 BTU/h | Split 24.000 BTU/h |
| ≤ 36.000 BTU/h | Split 36.000 BTU/h |
| ≤ 60.000 BTU/h | Cassete / Fan Coil |
| > 60.000 BTU/h | Sistema VRF ou múltiplos equipamentos |

### Alertas de Validação

- ⚠️ **Warning:** BTU/m² fora da faixa típica (200–2500 BTU/m²)
- 🔴 **Critical:** BTU total > 500.000 BTU/h (use simulação profissional)

---

## Trilha de Auditoria

Expanda a seção **Passo a Passo** nos resultados para ver cada etapa de cálculo com:
- Fórmula usada
- Valores de entrada
- Resultado intermediário
- Norma de referência

---

## Dicas de Uso

- Para maior precisão, informe a **Localização** — o sistema busca GHI real via API Open-Meteo
- Ambientes com `dia_todo` de exposição solar exigem dimensionamento mais conservador
- Compare a densidade BTU/m² com valores típicos de ~400–1000 BTU/m² para ambientes comerciais
