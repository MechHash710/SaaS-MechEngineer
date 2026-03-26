# 📄 Documents API (PDF Generation)

**Prefixo:** `/api/v1/documents`  
**🔒 Todos requerem:** `Authorization: Bearer <access_token>`

---

## POST /memorial/{tipo}

Gera o **Memorial de Cálculo** em PDF.  
`tipo`: `hvac` | `solar`

**Body:**
```json
{
  "project_id": "PROJ-001",
  "engineer_crea": "12345/D-SP",
  "equipment_btu": 24000.0,
  "localizacao": "São Paulo, SP",
  "step_by_step": { "Total BTU/h": 24000 },
  "constants_used": { "Fator Segurança": "+10%" },
  "references": ["ABNT NBR 16401-1"]
}
```

**Response 200:** `application/pdf` (download automático)

---

## POST /laudo/{tipo}

Gera o **Laudo Técnico de Engenharia** em PDF.  
`tipo`: `hvac` | `solar`

**Body:** mesmos campos de `/memorial/{tipo}` mais `cliente_nome`.

**Response 200:** `application/pdf`

---

## POST /especificacao

Gera a **Especificação de Equipamentos e Orçamento** em PDF.

**Body:**
```json
{
  "project_id": "PROJ-001",
  "equipment_spec": "Split 24.000 BTU/h Inverter",
  "application": "Climatização de Escritório",
  "items": [
    { "name": "Unidade Condensadora", "quantity": 1, "unit_price": 2500.00, "total": 2500.00 }
  ],
  "total_cost": 2500.00
}
```

**Response 200:** `application/pdf`

---

## POST /relatorio_completo

Gera o **Relatório Técnico Completo** (Memorial + Laudo + BOM) em um único PDF.

**Body:**
```json
{
  "project_id": "PROJ-001",
  "project_name": "Condomínio Solar",
  "engineer_name": "João Silva",
  "engineer_crea": "12345/D-SP",
  "location": "São Paulo, SP",
  "module_title": "Dimensionamento HVAC",
  "inputs": { "area_m2": 50, "...": "..." },
  "steps": [ { "step_name": "...", "result": "..." } ],
  "result_summary": { "total_btu_h": 24000 },
  "recommended_equipment": "1x Split 24.000 BTU/h"
}
```

**Response 200:** `application/pdf`

---

## POST /generate_art_data

Compila dados do dimensionamento para preenchimento da **ART no portal do CREA**. Não gera PDF; retorna JSON com todos os campos padronizados exigidos pela ART.

**Response 200:** JSON com `atividade`, `tipo_obra`, `normas_aplicadas`, `memorial_calculo`, etc.
