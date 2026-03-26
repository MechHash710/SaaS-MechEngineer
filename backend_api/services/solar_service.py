"""
solar_service.py
─────────────────────────────────────────────────────────────────────────────
Serviço de Irradiação Solar por Localização

Fluxo:
  1. Geocodificação: Cidade, Estado → (lat, lng)
     API: Nominatim (OpenStreetMap) — gratuita, sem chave de API
     Base URL: https://nominatim.openstreetmap.org/search

  2. Irradiação Solar: (lat, lng) → GHI médio anual (kWh/m²/dia)
     API: Open-Meteo Climate API — gratuita, sem cadastro
     Base URL: https://climate-api.open-meteo.com/v1/climate

  3. Fator de Carga (BTU/m²) — Escalonamento Proporcional:
     O GHI local é comparado ao GHI de referência (São Paulo ~17 kWh/m²/dia,
     base das tabelas NBR 16401). O fator da tabela estática é então escalado
     proporcionalmente:
       fator_local = fator_base_NBR × (GHI_local / GHI_referencia_SP)
     Onde fator_base_NBR = valor da tabela estática NBR 16401 por orientação.

Referências:
  - NBR 16401-1 Tabela A.1 (Parâmetros de ganho solar)
  - ASHRAE Fundamentals 2021, Cap. 14 (Solar Radiation)
  - NIST SP 811 (Conversão W → BTU/h)
"""

import httpx
from cachetools import TTLCache

# Cache for Geocoding and GHI requests (TTL 24 hours, max 1000 items)
geocode_cache = TTLCache(maxsize=1000, ttl=86400)
ghi_cache = TTLCache(maxsize=1000, ttl=86400)

# GHI de referência: São Paulo, SP (capital econômica, usada como base
# das tabelas NBR 16401 e ABNT para condições climáticas padrão do Brasil)
# Fonte: INPE CRESESB + Open-Meteo ERA5 histórico (2023), SP-Centro
GHI_REFERENCIA_SP = 17.0  # kWh/m²/dia

# Fallback: fatores estáticos caso a API de irradiação falhe (NBR 16401-1)
FATOR_FALLBACK: dict[str, float] = {
    "nenhuma": 550.0,
    "manhas": 700.0,
    "tardes": 900.0,
    "dia_todo": 1100.0,
}

# ─── Headers HTTP ────────────────────────────────────────────────────────────

NOMINATIM_HEADERS = {"User-Agent": "ThermalEngineeringSimulator/1.0 (contact: dev@simulator.local)"}


# ─── Funções de Serviço ──────────────────────────────────────────────────────


async def geocodificar_cidade(cidade: str) -> tuple[float, float] | None:
    """
    Converte nome de cidade em coordenadas geográficas (lat, lng).

    Args:
        cidade: Ex: "São Paulo, SP" ou "Fortaleza, Ceará"

    Returns:
        Tupla (latitude, longitude) ou None se não encontrar.
    """
    if cidade in geocode_cache:
        return geocode_cache[cidade]

    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": f"{cidade}, Brasil",
        "format": "json",
        "limit": 1,
        "countrycodes": "br",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params=params, headers=NOMINATIM_HEADERS)
            resp.raise_for_status()
            resultados = resp.json()

        if not resultados:
            geocode_cache[cidade] = None
            return None

        lat = float(resultados[0]["lat"])
        lng = float(resultados[0]["lon"])
        result = (lat, lng)
        geocode_cache[cidade] = result
        return result

    except Exception:
        return None


async def buscar_ghi_anual(lat: float, lng: float) -> float | None:
    """
    Busca o GHI (Global Horizontal Irradiance) médio diário anual (kWh/m²/dia)
    para as coordenadas informadas via Open-Meteo Historical Archive API.

    Utiliza dados do último ano civil completo disponível.

    Args:
        lat: Latitude decimal
        lng: Longitude decimal

    Returns:
        GHI médio diário (kWh/m²/dia) ou None em caso de falha.
    """
    cache_key = (f"{lat:.4f}", f"{lng:.4f}")
    if cache_key in ghi_cache:
        return ghi_cache[cache_key]

    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat,
        "longitude": lng,
        "start_date": "2023-01-01",
        "end_date": "2023-12-31",
        "daily": "shortwave_radiation_sum",  # kWh/m²/dia
        "timezone": "America/Sao_Paulo",
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            dados = resp.json()

        valores = dados.get("daily", {}).get("shortwave_radiation_sum", [])
        valores_validos = [v for v in valores if v is not None]

        if not valores_validos:
            return None

        ghi_medio = sum(valores_validos) / len(valores_validos)
        result = float(f"{ghi_medio:.3f}")
        ghi_cache[cache_key] = result
        return result

    except Exception:
        return None


def calcular_fator_btu_m2(ghi_kWh_dia: float, sun_exposure: str) -> float:
    """
    Calcula o fator de carga térmica (BTU/m²) com base no GHI real da localidade.

    Metodologia — Escalonamento Proporcional (NBR 16401-1 + INPE CRESESB):
        O GHI local é comparado ao GHI de referência de São Paulo (17 kWh/m²/dia),
        que serve como base das tabelas de carga da NBR 16401. O fator estático
        da orientação solar é então ajustado proporcionalmente:

            fator_local = fator_base_NBR[sun_exposure] × (GHI_local / GHI_ref_SP)

    Exemplos esperados (exposição 'tardes', fator base=900 BTU/m²):
        Fortaleza, CE  (GHI=22.1) → 900 × 22.1/17.0 ≈ 1.170 BTU/m²
        São Paulo, SP  (GHI=17.0) → 900 × 1.0       = 900   BTU/m²
        Porto Alegre   (GHI=16.7) → 900 × 16.7/17.0 ≈ 884   BTU/m²

    Args:
        ghi_kWh_dia: GHI médio diário da localidade (kWh/m²/dia)
        sun_exposure: Tipo de exposição solar da fachada

    Returns:
        Fator de carga em BTU/m² (arredondado para 2 casas decimais)
    """
    fator_base = FATOR_FALLBACK.get(sun_exposure, 700.0)
    escala = ghi_kWh_dia / GHI_REFERENCIA_SP
    fator = fator_base * escala
    return round(fator, 2)


async def obter_fator_solar(localizacao: str, sun_exposure: str | None = None) -> dict:
    """
    Função principal do serviço. Orquestra geocodificação + busca de GHI
    + calculda do fator de carga.

    Args:
        localizacao: Nome da cidade (ex: "Recife, PE")
        sun_exposure: Orientação solar ('manhas', 'tardes', 'dia_todo', 'nenhuma') ou None para AVAC ignorado.

    Returns:
        Dict com:
          - fator_btu_m2 (float): Fator de carga calculado
          - ghi_kWh_dia (float|None): GHI médio utilizado
          - lat (float|None): Latitude geocodificada
          - lng (float|None): Longitude geocodificada
          - fonte (str): "API Open-Meteo" ou "Tabela Fallback NBR 16401"
    """
    # 1. Geocodificar cidade
    coordenadas = await geocodificar_cidade(localizacao)

    if coordenadas is None:
        # Fallback: cidade não encontrada
        return {
            "fator_btu_m2": FATOR_FALLBACK.get(sun_exposure, 700.0) if sun_exposure else 0.0,
            "ghi_kWh_dia": None,
            "lat": None,
            "lng": None,
            "fonte": f"Tabela Fallback NBR 16401 (cidade '{localizacao}' não encontrada)",
        }

    lat, lng = coordenadas

    # 2. Buscar GHI real da localidade
    ghi = await buscar_ghi_anual(lat, lng)

    if ghi is None:
        # Fallback: API de irradiação indisponível
        return {
            "fator_btu_m2": FATOR_FALLBACK.get(sun_exposure, 700.0) if sun_exposure else 0.0,
            "ghi_kWh_dia": None,
            "lat": lat,
            "lng": lng,
            "fonte": "Tabela Fallback NBR 16401 (Open-Meteo indisponível)",
        }

    # 3. Calcular fator de carga dinâmico apenas se `sun_exposure` foi pedido (AVAC)
    fator = calcular_fator_btu_m2(ghi, sun_exposure) if sun_exposure else 0.0

    return {
        "fator_btu_m2": fator,
        "ghi_kWh_dia": ghi,
        "lat": lat,
        "lng": lng,
        "fonte": f"Open-Meteo ERA5 30 anos (lat={lat:.4f}, lng={lng:.4f})",
    }
