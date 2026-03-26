# Norm Step Mapping

Este arquivo mapeia cada `CalculationStep` dos simuladores à sua norma de referência específica.

## HVAC (simulation.py)
- `Fator Solar`: NBR 16401-1 Anexo A, Tabela A.1
- `Q_env`: NBR 16401-1 §5.2.1
- `Fator Pé-Direito`: NBR 16401-1 §5.3.2 (Correção Volumétrica)
- `Q_ocp(s)`: ASHRAE Fundamentals 2021, Cap. 18, Tabela 1
- `Q_ocp(l)`: ASHRAE Fundamentals 2021, Cap. 18, Tabela 1
- `Q_ilum`: NBR 16401-1 §5.2, Tabela 2
- `Q_elec`: NBR 16401-1 §5.2.4

## Solar Heating (solar_heating.py)
- `V_dia`: NBR 15569 Tabela 1 (Consumo Padrão)
- `ΔT`: Princípios de Termodinâmica
- `Q_dia`: NBR 15569 §4.1 (Equação de Energia)
- `E_dia`: NBR 15569 §4.1
- `Área Mínima`: NBR 15569 §5.2 (F-Chart Simplificado)

## Ventilation (ventilation.py)
- `Q_pessoas`: NBR 16401-3 Tabela 1 / ASHRAE 62.1 Tabela 6-1
- `Q_area`: NBR 16401-3 Tabela 1 / ASHRAE 62.1 Tabela 6-1
- `ACH`: NBR 16401-3 §6 (Renovação Mínima)
- `Ø_eq`: ASHRAE Fundamentals 2021, Cap. 21 (Dutos)

## Energy Efficiency (energy_efficiency.py)
- `Carga Iluminação`: INI-C §4.2 (DPI)
- `Carga Tér. Ajustada`: INI-C §4.3 (Envoltória)
- `Consumo AC`: INI-C §5 (Sistemas Térmicos)
- `Score`: INI-C §6 (Classificação)
