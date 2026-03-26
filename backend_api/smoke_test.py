import urllib.request
import urllib.error
import json

endpoints = [
    {
        "name": "HVAC",
        "url": "http://localhost:8000/api/v1/simulation/calculate_hvac",
        "payload": {"area_m2": 30.0, "pe_direito": 2.7, "num_peoples": 2, "num_equipment": 0, "watts_per_equipment": 0, "sun_exposure": "nenhuma", "localizacao": ""}
    },
    {
        "name": "Solar",
        "url": "http://localhost:8000/api/v1/simulation/calculate_solar",
        "payload": {"localizacao": "Sao Paulo, SP", "consumo_por_pessoa": 50, "num_peoples": 4, "temp_fria": 20, "temp_quente": 45, "tipo_sistema": "circulacao_natural", "tipo_coletor": "plano", "orientacao_telhado": "Norte", "inclinacao_telhado": 20.0}
    },
    {
        "name": "Ventilation",
        "url": "http://localhost:8000/api/v1/simulation/calculate_ventilation",
        "payload": {"area_m2": 50.0, "pe_direito": 2.7, "num_peoples": 5, "environment_type": "escritorio"}
    },
    {
        "name": "Efficiency",
        "url": "http://localhost:8000/api/v1/simulation/calculate_efficiency",
        "payload": {"area_m2": 100.0, "iluminacao_w_m2": 10.0, "ar_condicionado_cop": 3.0, "fator_vidro_percent": 30.0, "horas_uso_dia": 10, "dias_uso_ano": 250}
    }
]

for ep in endpoints:
    req = urllib.request.Request(ep["url"], method="POST")
    req.add_header("Content-Type", "application/json")
    data = json.dumps(ep["payload"]).encode("utf-8")
    try:
        with urllib.request.urlopen(req, data=data) as response:
            res_data = json.loads(response.read().decode())
            status = response.getcode()
            has_steps = "step_by_step" in res_data
            if status == 200 and has_steps:
                print(f"✅ {ep['name']} Passou (200 OK, steps: True)")
            else:
                print(f"❌ {ep['name']} Falhou (status: {status}, steps: {has_steps})")
    except urllib.error.HTTPError as e:
        print(f"❌ {ep['name']} Falhou (HTTP Error: {e.code})")
    except Exception as e:
        print(f"❌ {ep['name']} Falhou (Error: {str(e)})")

# Health
try:
    with urllib.request.urlopen("http://localhost:8000/health") as response:
        status = response.getcode()
        if status == 200:
            print(f"✅ Health Passou (200 OK)")
        else:
            print(f"❌ Health Falhou (status: {status})")
except Exception as e:
    print(f"❌ Health Falhou (Error: {str(e)})")
