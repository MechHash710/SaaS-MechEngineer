import pytest

from routers.solar_heating import SolarHeatingCalculator, SolarHeatingInput


@pytest.mark.asyncio
async def test_complete_sizing():
    calc = SolarHeatingCalculator()
    data = SolarHeatingInput(
        localizacao="São Paulo, SP",
        num_peoples=4,
        consumo_por_pessoa=50.0,
        temp_fria=20.0,
        temp_quente=45.0,
        tipo_sistema="circulacao_natural",
        tipo_coletor="plano",
        orientacao_telhado="Norte",
        inclinacao_telhado=22.0,
    )
    result = await calc.calculate(data)
    assert result.summary["consumo_diario_l"] == 200.0
    assert result.summary["volume_boiler_l"] == 240.0
    assert result.summary["num_coletores"] >= 1


@pytest.mark.asyncio
async def test_financial_analysis():
    calc = SolarHeatingCalculator()
    data = SolarHeatingInput(
        localizacao="Rio de Janeiro, RJ",
        num_peoples=5,
        consumo_por_pessoa=60.0,
        temp_fria=22.0,
        temp_quente=45.0,
        tipo_sistema="forcada",
        tipo_coletor="vacuo",
        orientacao_telhado="Norte",
        inclinacao_telhado=20.0,
    )
    result = await calc.calculate(data)
    assert result.summary["economia_mensal_kwh"] > 0
    assert result.summary["economia_anual_brl"] > 0


@pytest.mark.asyncio
async def test_different_solar_factor():
    calc = SolarHeatingCalculator()
    data_cwb = SolarHeatingInput(
        localizacao="Curitiba, PR",
        num_peoples=4,
        consumo_por_pessoa=50.0,
        temp_fria=20.0,
        temp_quente=45.0,
        tipo_sistema="circulacao_natural",
        tipo_coletor="plano",
        orientacao_telhado="Norte",
        inclinacao_telhado=22.0,
    )
    data_for = data_cwb.model_copy(update={"localizacao": "Fortaleza, CE"})

    res_cwb = await calc.calculate(data_cwb)
    res_for = await calc.calculate(data_for)

    # Diferentes GHI (fatores solares) devem resultar em diferentes outputs de passo para a API
    assert res_cwb.steps[4].result != res_for.steps[4].result


@pytest.mark.asyncio
async def test_solar_fraction_bounds():
    calc = SolarHeatingCalculator()
    data = SolarHeatingInput(
        localizacao="Brasília, DF",
        num_peoples=2,
        consumo_por_pessoa=50.0,
        temp_fria=25.0,
        temp_quente=40.0,
        tipo_sistema="circulacao_natural",
        tipo_coletor="vacuo",
        orientacao_telhado="Norte",
        inclinacao_telhado=15.0,
    )
    result = await calc.calculate(data)
    fs = result.summary["fracao_solar"]
    assert 0 <= fs <= 100.0
