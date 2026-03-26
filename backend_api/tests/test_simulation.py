import pytest

from routers.simulation import HvacCalculator, ThermalInput


@pytest.mark.asyncio
async def test_typical_case():
    calc = HvacCalculator()
    data = ThermalInput(
        area_m2=30.0,
        pe_direito=2.70,
        num_peoples=2,
        num_equipment=0,
        watts_per_equipment=0,
        sun_exposure="nenhuma",
        localizacao="",
    )
    result = await calc.calculate(data)

    assert result.summary["total_btu"] > 14000
    assert result.summary["total_btu"] < 16000


@pytest.mark.asyncio
async def test_invalid_input():
    calc = HvacCalculator()
    data = ThermalInput(
        area_m2=-10.0,
        pe_direito=2.70,
        num_peoples=1,
        num_equipment=0,
        watts_per_equipment=0,
        sun_exposure="nenhuma",
        localizacao="",
    )
    result = await calc.calculate(data)
    assert any("Carga térmica calculada negativa" in w.message for w in result.warnings)


@pytest.mark.asyncio
async def test_warnings_logic():
    calc = HvacCalculator()
    data = ThermalInput(
        area_m2=10.0,
        pe_direito=5.0,  # Muito alto
        num_peoples=50,  # Alta densidade
        num_equipment=10,
        watts_per_equipment=1000,
        sun_exposure="dia_todo",
        localizacao="",
    )
    result = await calc.calculate(data)
    assert any("Pé-direito de 5.0m é elevado" in w.message for w in result.warnings)
    assert any("Densidade de carga altíssima" in w.message for w in result.warnings)


@pytest.mark.asyncio
async def test_calculation_steps():
    calc = HvacCalculator()
    data = ThermalInput(
        area_m2=20.0,
        pe_direito=2.70,
        num_peoples=2,
        num_equipment=0,
        watts_per_equipment=0,
        sun_exposure="nenhuma",
        localizacao="",
    )
    result = await calc.calculate(data)

    # Verify step formats
    assert len(result.steps) > 0
    step_names = [step.step_name for step in result.steps]
    assert any("Fator Pé-Direito" in s for s in step_names)

    # Test fields
    for step in result.steps:
        assert hasattr(step, "formula")
        assert hasattr(step, "norm_reference")
        assert hasattr(step, "unit")


@pytest.mark.asyncio
async def test_equipment_recommendation():
    calc = HvacCalculator()
    data = ThermalInput(
        area_m2=9.0,
        pe_direito=2.70,
        num_peoples=1,
        num_equipment=0,
        watts_per_equipment=0,
        sun_exposure="nenhuma",
        localizacao="",
    )
    result = await calc.calculate(data)
    assert "9.000 BTU/h" in result.summary["suggested_equipment"]
