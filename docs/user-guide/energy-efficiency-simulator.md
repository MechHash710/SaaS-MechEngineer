# Simulador de Eficiência Energética (INI-C)

Analisa o desempenho energético de edificações comerciais e de serviços conforme a **Instrução Normativa para Classificação de Eficiência Energética de Edificações Comerciais, de Serviços e Públicas (INI-C)** do INMETRO/PBE Edifica.

---

## O que este simulador calcula

| Resultado | Descrição |
|---|---|
| Score INI-C | Pontuação de 0 a 100 baseada nos parâmetros da edificação |
| Classificação ENCE | Etiqueta de A (mais eficiente) a E (menos eficiente) |
| Economia estimada | Percentual de redução no consumo vs. edificação de referência |
| Consumo base (kWh/ano) | Consumo estimado sem otimizações |
| Consumo otimizado (kWh/ano) | Consumo estimado com os parâmetros informados |

---

## Campos do formulário

| Campo | Unidade | Descrição |
|---|---|---|
| Área Construída | m² | Área total climatizada/condicionada |
| Fator de Vidro (Fachada) | % | Percentual da fachada que é vidro (WWR — Window-to-Wall Ratio) |
| Densidade de Iluminação | W/m² | Potência instalada de iluminação por m² |
| COP do Ar Condicionado | — | Coeficiente de Performance do sistema AVAC (típico: 2,5–4,5) |
| Uso Diário | h/dia | Horas de operação por dia |
| Uso Anual | dias/ano | Dias de operação por ano |

### Valores de referência por parâmetro

| Parâmetro | Referência INI-C | Faixa A (eficiente) |
|---|---|---|
| WWR | ≤ 40% | ≤ 30% |
| Iluminação | 12 W/m² | ≤ 8 W/m² |
| COP do AC | 2,8 | ≥ 3,5 |
| Uso diário | 8 h | — |

---

## Classificação ENCE

A etiqueta é definida pelo Score INI-C calculado:

| Classificação | Score | Descrição |
|---|---|---|
| A | ≥ 80 | Altamente eficiente — referência de mercado |
| B | 65–79 | Eficiente — acima da média |
| C | 50–64 | Regular — atende o mínimo normativo |
| D | 35–49 | Abaixo do padrão — necessita melhorias |
| E | < 35 | Ineficiente — não recomendado |

---

## Metodologia simplificada INI-C

O simulador aplica a metodologia paramétrica simplificada (Método Prescritivo) da INI-C:

```
Score = Σ (peso_i × nota_i)

Onde os componentes são:
  - Envoltória (WWR, transmitância, absortância)
  - Iluminação (densidade de potência)
  - Condicionamento de ar (COP, sistema)
  - Aquecimento de água (quando aplicável)

Classificação final: baseada no Score total ponderado
```

Para análises mais precisas (Método de Simulação), o módulo EnergyPlus Premium (M9) oferece simulação horária completa.

---

## Interpretando os resultados

**Score alto (≥ 65) + Classificação A ou B**: A edificação está bem projetada. Foque em manutenção e monitoramento.

**Score médio (50–64) + Classificação C**: Há espaço para melhoria. Priorize troca de iluminação para LED e melhoria do COP do AC.

**Score baixo (< 50) + Classificação D ou E**: Reforma energética recomendada. Considere:
- Reduzir WWR com brises ou películas
- Iluminação LED com sensores de presença
- AC de alta eficiência (inverter, COP ≥ 4,0)
- Isolamento térmico da cobertura

---

## Normas e referências

- **Instrução Normativa INI-C (INMETRO/2021)** — Eficiência Energética em Edificações Comerciais
- **ABNT NBR 16401-1** — Parâmetros de conforto térmico e cargas térmicas
- **PBE Edifica** — Programa Brasileiro de Etiquetagem de Edificações
- **ASHRAE Standard 90.1:2022** — Energy Standard for Buildings (referência complementar)

---

## Como usar os resultados no laudo técnico

1. Calcule com os parâmetros reais da edificação
2. Clique em **Baixar Laudo PDF** após o resultado
3. O laudo inclui: classificação ENCE, score detalhado, comparativo com edificação de referência e recomendações de melhoria

O laudo é assinado digitalmente com CREA do responsável técnico quando configurado nas preferências.
