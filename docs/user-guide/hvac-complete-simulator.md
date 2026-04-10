# Simulador HVAC Completo

Dimensiona sistemas de ar-condicionado combinando carga térmica avançada (NBR 16401-1) com ventilação e qualidade do ar interior (NBR 16401-3 / ASHRAE 62.1), oferecendo uma solução integral para projetos comerciais e industriais.

---

## O que este simulador calcula

| Resultado | Descrição | Unidade |
|---|---|---|
| Carga Térmica Total | Capacidade de refrigeração necessária | BTU/h e kW |
| Vazão de Ar de Renovação | Ar fresco necessário baseado em área/ocupantes | m³/h |
| Diâmetro do Duto (Principal) | Seção recomendada para ar de renovação | mm |
| Sugestão de Equipamento | Equipamento ótimo (Inverter, VRF, Chiller, etc) | — |
| Fator Sensível Estimado | Razão entre carga sensível e carga total | Adimensional |

---

## Campos do formulário

| Campo | Unidade | Valor típico | Obrigatório |
|---|---|---|---|
| Área do Ambiente | m² | 20–5.000 | Sim |
| Pé-direito | m | 2,40–6,00 | Sim |
| Número de Ocupantes | pessoas | 1–500 | Sim |
| Tipo de Ambiente | — | Escritório / Auditório / Sala de Aula | Sim |
| Equipamentos | qtd. | 0–100 | Sim |
| Exposição Solar | — | Manhã / Tarde / Dia Todo / Nenhuma | Sim |
| Localização | — | Cidade, Estado | Opcional |

### Opções Dinâmicas de Uso
A seleção de "Tipo de Ambiente" altera automaticamente os padrões normativos:
- **Escritório**: Dissipação térmica moderada, renovação padrão.
- **Auditório**: Alta carga latente por ocupante, alta taxa de renovação.
- **Sala de Aula**: Alta densidade de ocupação, taxas de ventilação rígidas (ASHRAE 62.1).

---

## Metodologia de cálculo

A simulação completa é a mescla de duas etapas simultâneas:

### 1. Carga Térmica (Refrigeração)
```
Carga Total (BTU/h) = Envoltória + Pessoas(Sensível+Latente) + Iluminação + Equipamentos
```
*GHI Local via Open-Meteo é utilizado para recalcular a carga de envoltória (insolação), e fatores de correção climáticos são aplicados.*

### 2. Tratamento do Ar Externo (Ventilação)
```
Q_ar_externo (m³/h) = (Área * Taxa_Área + Ocupantes * Taxa_Pessoa) * 3,6
Carga Latente Ext. = Q_ar_externo * ΔW * H_latente
```
*A carga do ar de renovação é adicionada ao fechamento do balanço térmico total.*

---

## Interpretando os resultados

**Equipamento Sugerido**: Além do cálculo da capacidade, o simulador cruza o BTU/h necessário com equipamentos do mercado atual. Sistemas Inverter e VAV (Volume de Ar Variável) são priorizados para cargas parciais.

**Fator Térmico de Segurança**: Recomenda-se manter pelo menos 10% de folga. Para projetos hospitalares ou data centers, avalie 15-20%.

**Ventilação e Dutos**: O diâmetro do duto sugerido considera velocidade de 3,0 m/s a 4,0 m/s para restrição acústica. Se o pé-direito não permitir o diâmetro sugerido redondo, utilize dutos retangulares equivalentes.

---

## Normas aplicadas

- **ABNT NBR 16401-1** — Ar-condicionado: Projetos (Carga Térmica)
- **ABNT NBR 16401-3** — Ar-condicionado: Qualidade do Ar Interior
- **ASHRAE 2021** (Capítulo 18) — Nonresidential Cooling and Heating Load Calculations
- **ASHRAE Standard 62.1** — Ventilation for Acceptable Indoor Air Quality

---

## Como gerar o PDF após o cálculo

1. Preencha todos os parâmetros térmicos e de ventilação.
2. Clique no botão **Simular**.
3. Baixe o relatório clicando em **Memorial Específico Completo PDF**.
4. O memorial consolida as tabelas de Carga Térmica e Ventilação em um documento de engenharia pronto para uso.
