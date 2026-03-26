import asyncio
import sys

sys.path.insert(0, ".")
from services.solar_service import obter_fator_solar


async def test():
    print("=== Teste: Fortaleza, CE (Sol da Tarde) ===")
    r1 = await obter_fator_solar("Fortaleza, CE", "tardes")
    print(f"  GHI: {r1['ghi_kWh_dia']} kWh/m2/dia")
    print(f"  Fator BTU/m2: {r1['fator_btu_m2']}")
    print(f"  Fonte: {r1['fonte']}")

    print()
    print("=== Teste: Porto Alegre, RS (Sol da Tarde) ===")
    r2 = await obter_fator_solar("Porto Alegre, RS", "tardes")
    print(f"  GHI: {r2['ghi_kWh_dia']} kWh/m2/dia")
    print(f"  Fator BTU/m2: {r2['fator_btu_m2']}")
    print(f"  Fonte: {r2['fonte']}")

    print()
    print("=== Fallback (cidade invalida) ===")
    r3 = await obter_fator_solar("CidadeInvalida, XX", "tardes")
    print(f"  Fator BTU/m2: {r3['fator_btu_m2']}")
    print(f"  Fonte: {r3['fonte']}")


asyncio.run(test())
