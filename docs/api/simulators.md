# 🧮 Simulators API Endpoints

**Prefixo:** `/api/v1/simulation`  
**🔒 Todos requerem:** `Authorization: Bearer <access_token>`

---

## POST /calculate_hvac

Calcula a Carga Térmica para dimensionamento de ar-condicionado (NBR 16401-1).

**Body:**
```json
{
  "area_m2": 50.0,
  "pe_direito": 3.0,
  "num_peoples": 10,
  "num_equipment": 5,
  "watts_per_equipment": 100.0,
  "sun_exposure": "tardes",
  "localizacao": "São Paulo, SP"
}
```
> `sun_exposure`: `"manhas"` | `"tardes"` | `"dia_todo"` | `"nenhuma"`

**Response 200:**
```json
{
  "total_btu_h": 24000.0,
  "total_watts": 7034.0,
  "suggested_equipment": "1x Split 24.000 BTU/h",
  "step_by_step": { "...": "..." },
  "warnings": [],
  "constants_used": { "...": "..." },
  "references": ["ABNT NBR 16401-1", "ASHRAE Fundamentals 2021"]
}
```

---

## POST /calculate_solar

Dimensiona um sistema de Aquecimento Solar de AQS (NBR 15569).

**Body:**
```json
{
  "localizacao": "Rio de Janeiro, RJ",
  "num_peoples": 4,
  "consumo_por_pessoa": 50.0,
  "temp_fria": 20.0,
  "temp_quente": 45.0,
  "tipo_sistema": "circulacao_natural",
  "tipo_coletor": "plano",
  "orientacao_telhado": "Norte",
  "inclinacao_telhado": 22.0
}
```
> `tipo_sistema`: `"circulacao_natural"` | `"forcada"`  
> `tipo_coletor`: `"plano"` | `"vacuo"`

**Response 200:**
```json
{
  "consumo_diario_l": 200.0,
  "area_coletores_m2": 4.0,
  "volume_boiler_l": 240,
  "num_coletores": 2,
  "fracao_solar": 75.0,
  "economia_anual_brl": 1200.50,
  "...": "..."
}
```

---

## POST /calculate_ventilation

Dimensiona a Ventilação Mecânica (ASHRAE 62.1 / NBR 16401-3).

**Body:**
```json
{
  "area_m2": 100.0,
  "pe_direito": 3.0,
  "num_peoples": 20,
  "environment_type": "escritorio"
}
```
> `environment_type`: `"escritorio"` | `"auditorio"` | `"sala_aula"` | `"loja"`

**Response 200:**
```json
{
  "vazao_ar_externo_m3h": 324.0,
  "renovacoes_por_hora_ach": 1.08,
  "diametro_duto_principal_mm": 200.0,
  "velocidade_duto_m_s": 4.5,
  "recomendacao": "..."
}
```

---

## POST /calculate_efficiency

Avalia a Eficiência Energética (INI-C / PBE Edifica).

**Body:**
```json
{
  "area_m2": 150.0,
  "iluminacao_w_m2": 12.0,
  "ar_condicionado_cop": 3.2,
  "fator_vidro_percent": 30.0,
  "horas_uso_dia": 10,
  "dias_uso_ano": 250
}
```

**Response 200:**
```json
{
  "consumo_anual_kwh": 38250.0,
  "indicador_kwh_m2_ano": 255.0,
  "score_eficiencia": "C",
  "recomendacao": "Classificação estimada: Nível C..."
}
```

---

## POST /calculate_hvac_complete

Simulador HVAC Completo: integra Carga Térmica + Ventilação + Seleção de Equipamento e Dutos.

Combina os inputs de `/calculate_hvac` e `/calculate_ventilation` em um único payload.
