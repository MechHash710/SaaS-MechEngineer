import asyncio
from routers.simulation import HvacCalculator, ThermalInput
from routers.solar_heating import SolarHeatingCalculator, SolarHeatingInput
from routers.ventilation import VentilationCalculator, VentilationInput
from routers.energy_efficiency import EnergyEfficiencyCalculator, EnergyEfficiencyInput

async def test_hvac():
    print("--- HVAC Test ---")
    calc = HvacCalculator()
    # Case 1: Minimal (30m2, 2 people, no sun)
    data = ThermalInput(
        area_m2=30.0,
        pe_direito=2.7,
        num_peoples=2,
        num_equipment=0,
        watts_per_equipment=0,
        sun_exposure="nenhuma",
        localizacao=""
    )
    res = await calc.calculate(data)
    print(f"Minimal Case (30m2, 2p): {res.summary['total_btu']} BTU/h ({res.summary['total_btu']/30:.1f} BTU/m2)")
    
    # Case 2: Standard (30m2, 2 people, Afternoon sun in Fortaleza)
    data_for = ThermalInput(
        area_m2=30.0,
        pe_direito=2.7,
        num_peoples=2,
        num_equipment=0,
        watts_per_equipment=0,
        sun_exposure="tardes",
        localizacao="Fortaleza, CE"
    )
    res_for = await calc.calculate(data_for)
    print(f"Hot Case (Fortaleza, 30m2, 2p, tardes): {res_for.summary['total_btu']} BTU/h ({res_for.summary['total_btu']/30:.1f} BTU/m2)")

async def test_solar():
    print("\n--- Solar Test ---")
    calc = SolarHeatingCalculator()
    # Case 1: Using localizacao
    data = SolarHeatingInput(
        localizacao="Sao Paulo, SP",
        num_peoples=4,
        consumo_por_pessoa=50.0,
        temp_fria=20.0,
        temp_quente=45.0,
        tipo_sistema="circulacao_natural",
        tipo_coletor="plano",
        orientacao_telhado="Norte",
        inclinacao_telhado=20.0
    )
    res = await calc.calculate(data)
    print(f"Solar Sizing (SP): {res.summary['area_coletores_m2']} m2, {res.summary['num_coletores']} collectors")

    # Case 2: Using direct radiation (from payload_solar.json sync)
    data_direct = SolarHeatingInput(
        localizacao="", # Should be ignored if radiation is provided
        num_peoples=4,
        consumo_por_pessoa=50.0,
        temp_fria=20.0,
        temp_quente=45.0,
        tipo_sistema="circulacao_natural",
        tipo_coletor="plano",
        orientacao_telhado="Norte",
        inclinacao_telhado=20.0,
        insolacao_kwh_m2_dia=5.0
    )
    res_direct = await calc.calculate(data_direct)
    print(f"Solar Sizing (Direct 5.0 kWh/m2): {res_direct.summary['area_coletores_m2']} m2, {res_direct.summary['num_coletores']} collectors")

async def test_ventilation():
    print("\n--- Ventilation Test ---")
    calc = VentilationCalculator()
    data = VentilationInput(
        area_m2=50.0,
        pe_direito=2.7,
        num_peoples=5,
        environment_type="escritorio"
    )
    res = await calc.calculate(data)
    print(f"Ventilation: {res.summary['vazao_ar_externo_m3h']} m3/h, Duct: {res.summary['diametro_duto_principal_mm']} mm")

async def test_efficiency():
    print("\n--- Efficiency Test ---")
    calc = EnergyEfficiencyCalculator()
    data = EnergyEfficiencyInput(
        area_m2=100.0,
        iluminacao_w_m2=10.0,
        ar_condicionado_cop=3.0,
        fator_vidro_percent=30.0,
        horas_uso_dia=10,
        dias_uso_ano=250
    )
    res = await calc.calculate(data)
    print(f"Efficiency Score: {res.summary['score_eficiencia']} ({res.summary['indicador_kwh_m2_ano']} kWh/m2.ano)")

async def main():
    await test_hvac()
    await test_solar()
    await test_ventilation()
    await test_efficiency()

if __name__ == "__main__":
    asyncio.run(main())
