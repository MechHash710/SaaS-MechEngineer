import random

from locust import HttpUser, between, task

# Test Data
HVAC_PAYLOAD = {
    "area_m2": 50,
    "pe_direito": 3.0,
    "num_peoples": 10,
    "num_equipment": 5,
    "watts_per_equipment": 100,
    "sun_exposure": "tardes",
    "localizacao": "Sao Paulo",
}

SOLAR_PAYLOAD = {
    "localizacao": "Rio de Janeiro",
    "num_peoples": 4,
    "consumo_por_pessoa": 50.0,
    "temp_fria": 20.0,
    "temp_quente": 45.0,
    "tipo_sistema": "circulacao_natural",
    "tipo_coletor": "plano",
    "orientacao_telhado": "Norte",
    "inclinacao_telhado": 22.0,
}

VENT_PAYLOAD = {
    "area_m2": 100.0,
    "pe_direito": 3.0,
    "num_peoples": 20,
    "environment_type": "escritorio",
}

EFF_PAYLOAD = {
    "area_m2": 150.0,
    "iluminacao_w_m2": 12.0,
    "ar_condicionado_cop": 3.2,
    "fator_vidro_percent": 30.0,
    "horas_uso_dia": 10.0,
    "dias_uso_ano": 250,
}


class BaseAPIUser(HttpUser):
    abstract = True
    wait_time = between(1, 3)

    def on_start(self):
        """Standard setup: login and get token."""
        # Note: In a real system, we'd need a way to bypass the Stripe plan check for load testing,
        # or use users with active subscriptions. Assuming users exist for now.
        email = f"test_{random.randint(1, 1000)}@test.com"
        # Since we might not have these users in DB, for load testing we typically create one admin
        # or test user and keep using their token. Let's assume there's a seeder or we use a fixture.
        # Fallback: Just hit login. If it fails, we register on the fly.
        self.login_or_register(email)

    def login_or_register(self, email):
        password = "password123"
        # Try login
        response = self.client.post(
            "/api/v1/auth/login", data={"username": email, "password": password}
        )

        if response.status_code == 200:
            self.token = response.json().get("access_token")
        else:
            # Register first
            self.client.post(
                "/api/v1/auth/register",
                json={"email": email, "password": password, "name": "Load Test User"},
            )
            # Login again
            resp2 = self.client.post(
                "/api/v1/auth/login", data={"username": email, "password": password}
            )
            if resp2.status_code == 200:
                self.token = resp2.json().get("access_token")
            else:
                self.token = None

        if self.token:
            self.client.headers.update({"Authorization": f"Bearer {self.token}"})


class CommonEngineerUser(BaseAPIUser):
    """
    Scenario 1 (Common Engineer): login -> simulate HVAC -> simulate Solar -> generate PDF -> logout
    weight: 3
    """

    weight = 3

    @task
    def execute_flow(self):
        # 1. Simulate HVAC
        self.client.post(
            "/api/v1/simulation/calculate_hvac", json=HVAC_PAYLOAD, name="1_HVAC_Simulation"
        )

        # 2. Simulate Solar
        self.client.post(
            "/api/v1/solar/calculate_solar", json=SOLAR_PAYLOAD, name="1_Solar_Simulation"
        )

        # 3. Generate PDF (Requires a project_id normally, we use dummy data for load testing template generation)
        # Using the base PDF payload as it appears in the frontend
        pdf_payload = {
            "type": "relatorio_completo",
            "data": {
                "engineer_nome": "Eng. Tester",
                "engineer_crea": "123456",
                "localizacao": "Sao Paulo",
                "hvac_result": {"summary": {"total_btu": 24000}},
                "solar_result": {"summary": {"volume_boiler": 200}},
            },
        }
        self.client.post("/api/v1/documents/generate", json=pdf_payload, name="1_Generate_PDF")

        # Note: "Logout" is typically just clearing the token client-side,
        # but if there's a logout endpoint we'd call it here.


class IntenseUsageUser(BaseAPIUser):
    """
    Scenario 2 (Intense Usage): 10 consecutive simulations of varying types.
    weight: 1
    """

    weight = 1

    @task
    def burst_simulations(self):
        for _ in range(10):
            sim_type = random.choice(
                [
                    ("/api/v1/simulation/calculate_hvac", HVAC_PAYLOAD, "2_HVAC_Sim"),
                    ("/api/v1/solar/calculate_solar", SOLAR_PAYLOAD, "2_Solar_Sim"),
                    ("/api/v1/ventilation/calculate_ventilation", VENT_PAYLOAD, "2_Vent_Sim"),
                    ("/api/v1/efficiency/calculate_efficiency", EFF_PAYLOAD, "2_Eff_Sim"),
                ]
            )
            endpoint, payload, name = sim_type
            self.client.post(endpoint, json=payload, name=name)


# Scenario 3 (Stress): 100 simultaneous users with ramp-up 10 users/sec
# This is handled mostly via the Locust command line arguments (-u 100 -r 10)
# instead of defining a specific class, as it's a configuration of how the runner acts.
