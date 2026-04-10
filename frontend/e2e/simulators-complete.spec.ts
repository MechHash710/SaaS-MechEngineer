import { test, expect } from '@playwright/test';

/**
 * simulators-complete.spec.ts
 *
 * Cobertura E2E dos simuladores ainda sem testes completos:
 *   - Ventilação (ASHRAE 62.1 / NBR 16401-3)
 *   - Eficiência Energética (INI-C)
 *   - HVAC Completo
 *
 * Padrão de autenticação: injeta token fake + mock de /auth/me
 * (mesmo padrão do simulation.spec.ts já existente).
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function setupAuth(page: import('@playwright/test').Page) {
  await page.route('**/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      json: { id: 'qa-user', email: 'qatester@valido.com', name: 'QA Tester', plan: 'pro' },
    });
  });

  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('@EngenhariaPro:token', 'fake-token');
    localStorage.setItem('@EngenhariaPro:refresh_token', 'fake-refresh');
  });
  await page.reload();
}

async function navigateToModule(
  page: import('@playwright/test').Page,
  tabText: string,
) {
  await page.goto('/?mode=dashboard');
  const tab = page.locator(`button:has-text("${tabText}"), a:has-text("${tabText}")`).first();
  await tab.waitFor({ state: 'visible', timeout: 12000 });
  await tab.click();
}

// ─── Mock responses ───────────────────────────────────────────────────────────

const VENTILATION_MOCK_RESPONSE = {
  vazao_ar_externo_m3h: 306.0,
  diametro_duto_principal_mm: 328,
  q_total_m3h: 306.0,
  q_pessoas_ls: 50.0,
  q_area_ls: 35.0,
  volume_duto_m3: 0.085,
  ach: 3.06,
  references: ['ABNT NBR 16401-3', 'ASHRAE Standard 62.1'],
  constants_used: {},
  step_by_step: { 'Q_pessoas [L/s]': '50 L/s', 'Q_area [L/s]': '35 L/s', 'Q_total [m³/h]': '306 m³/h' },
  warnings: [],
};

const EFFICIENCY_MOCK_RESPONSE = {
  score_eficiencia: 'B',
  indicador_kwh_m2_ano: 72.5,
  consumo_anual_kwh: 45000,
  recomendacao: 'Economia estimada de 22% em relação ao baseline.',
  score: 72.5,
  classification: 'B',
  economia_percent: 22.3,
  consumo_base_kwh_ano: 45000,
  consumo_otimizado_kwh_ano: 34965,
  referencias: ['Instrução Normativa INI-C'],
  step_by_step: { 'Score INI-C': '72.5', 'Classificação': 'B' },
  warnings: [],
};

const HVAC_COMPLETE_MOCK_RESPONSE = {
  carga_termica_btu_h: 24000,
  vazao_ar_m3h: 480,
  duto_diametro_mm: 400,
  equipamento_recomendado: '24.000 BTU/h — Split Cassete',
  potencia_eletrica_estimada_w: 2200,
  eficiencia_estimada: 'Classe A',
  tubulacao_liquida: '3/8',
  tubulacao_succao: '5/8',
  comprimento_tubulacao_m: 10,
  references: ['NBR 16401-1', 'NBR 16401-3'],
  constants_used: {},
  step_by_step: { 'TOTAL [BTU/h]': '24000' },
  warnings: [],
};

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 1 — VENTILAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Módulo Ventilação — Cobertura Completa', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await navigateToModule(page, 'Ventilação');
  });

  // ESTADO 1 — Carregamento inicial
  test('exibe todos os campos obrigatórios ao carregar', async ({ page }) => {
    await expect(page.locator('input[name="area_m2"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[name="pe_direito"]')).toBeVisible();
    await expect(page.locator('input[name="num_peoples"]')).toBeVisible();
  });

  test('botão Calcular está visível e habilitado por padrão', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /calcular/i }),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /calcular/i })).toBeEnabled();
  });

  // ESTADO 2 — Happy path
  test('calcula e exibe resultado com dados válidos', async ({ page }) => {
    await page.route('**/simulation/calculate_ventilation', async (route) => {
      await route.fulfill({ status: 200, json: VENTILATION_MOCK_RESPONSE });
    });

    await page.fill('input[name="area_m2"]', '100');
    await page.fill('input[name="pe_direito"]', '2.70');
    await page.fill('input[name="num_peoples"]', '10');

    await page.getByRole('button', { name: /calcular/i }).click();

    // Resultado deve aparecer com valor e unidade
    await expect(page.locator('text=306')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=m³/h').first()).toBeVisible();
  });

  // ESTADO 3 — Validação
  test('mostra erro ao submeter com campo de área vazio', async ({ page }) => {
    await page.fill('input[name="pe_direito"]', '2.70');
    await page.fill('input[name="num_peoples"]', '5');
    // Limpa área e tenta enviar
    await page.fill('input[name="area_m2"]', '');
    await page.getByRole('button', { name: /calcular/i }).click();
    // Deve mostrar algum indicador de erro (classe text-red ou mensagem)
    await expect(page.locator('.text-red-600, .text-red-500').first()).toBeVisible({ timeout: 5000 });
  });

  // ESTADO 4 — Loading
  test('botão fica disabled durante chamada à API', async ({ page }) => {
    await page.route('**/simulation/calculate_ventilation', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await route.fulfill({ status: 200, json: VENTILATION_MOCK_RESPONSE });
    });

    await page.fill('input[name="area_m2"]', '50');
    await page.fill('input[name="pe_direito"]', '2.70');
    await page.fill('input[name="num_peoples"]', '5');
    await page.getByRole('button', { name: /calcular/i }).click();

    await expect(page.getByRole('button', { name: /calcular/i })).toBeDisabled();
  });

  // ESTADO 5 — Pós-resultado
  test('botão de download PDF aparece após cálculo bem-sucedido', async ({ page }) => {
    await page.route('**/simulation/calculate_ventilation', async (route) => {
      await route.fulfill({ status: 200, json: VENTILATION_MOCK_RESPONSE });
    });

    await page.fill('input[name="area_m2"]', '80');
    await page.fill('input[name="pe_direito"]', '2.70');
    await page.fill('input[name="num_peoples"]', '8');
    await page.getByRole('button', { name: /calcular/i }).click();

    await expect(page.locator('text=306')).toBeVisible({ timeout: 10000 });
    // Botão de PDF deve estar visível após resultado
    await expect(page.getByRole('button', { name: /avançar|documento|pdf|memorial|baixar/i }).first()).toBeVisible({ timeout: 5000 });
  });

  test('erro de API exibe mensagem em português', async ({ page }) => {
    const dialogPromise = page.waitForEvent('dialog');
    page.once('dialog', dialog => dialog.dismiss());

    await page.route('**/simulation/calculate_ventilation', async (route) => {
      await route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    await page.fill('input[name="area_m2"]', '50');
    await page.fill('input[name="pe_direito"]', '2.70');
    await page.fill('input[name="num_peoples"]', '5');
    await page.getByRole('button', { name: /calcular/i }).click();

    const dialog = await dialogPromise;
    expect(dialog.message()).toMatch(/falha|erro|conexão|tente novamente/i);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 2 — EFICIÊNCIA ENERGÉTICA (INI-C)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Módulo Eficiência Energética (INI-C) — Cobertura Completa', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await navigateToModule(page, 'Eficiência (INI-C)');
  });

  // ESTADO 1 — Carregamento inicial
  test('exibe todos os campos obrigatórios ao carregar', async ({ page }) => {
    await expect(page.locator('input[name="area_m2"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[name="fator_vidro_percent"]')).toBeVisible();
    await expect(page.locator('input[name="iluminacao_w_m2"]')).toBeVisible();
    await expect(page.locator('input[name="ar_condicionado_cop"]')).toBeVisible();
  });

  test('botão Calcular está visível e habilitado por padrão', async ({ page }) => {
    await expect(page.getByRole('button', { name: /calcular/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /calcular/i })).toBeEnabled();
  });

  // ESTADO 2 — Happy path
  test('calcula e exibe classificação ENCE após dados válidos', async ({ page }) => {
    await page.route('**/simulation/calculate_efficiency', async (route) => {
      await route.fulfill({ status: 200, json: EFFICIENCY_MOCK_RESPONSE });
    });

    await page.fill('input[name="area_m2"]', '500');
    await page.fill('input[name="fator_vidro_percent"]', '40');
    await page.fill('input[name="iluminacao_w_m2"]', '12');
    await page.fill('input[name="ar_condicionado_cop"]', '3.5');
    await page.fill('input[name="horas_uso_dia"]', '8');
    await page.fill('input[name="dias_uso_ano"]', '250');

    await page.getByRole('button', { name: /calcular/i }).click();

    // Classificação e score devem aparecer
    await expect(page.locator('text=72').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=B').first()).toBeVisible();
  });

  test('resultado de economia nunca exibe valor acima de 100%', async ({ page }) => {
    await page.route('**/simulation/calculate_efficiency', async (route) => {
      await route.fulfill({ status: 200, json: EFFICIENCY_MOCK_RESPONSE });
    });

    await page.fill('input[name="area_m2"]', '500');
    await page.fill('input[name="fator_vidro_percent"]', '40');
    await page.fill('input[name="iluminacao_w_m2"]', '12');
    await page.fill('input[name="ar_condicionado_cop"]', '3.5');
    await page.fill('input[name="horas_uso_dia"]', '8');
    await page.fill('input[name="dias_uso_ano"]', '250');
    await page.getByRole('button', { name: /calcular/i }).click();

    await expect(page.locator('text=22').first()).toBeVisible({ timeout: 10000 });
    // Garantir que nenhum valor de % exibido seja > 100
    const percentTexts = await page.locator('text=/%/').allTextContents();
    for (const t of percentTexts) {
      const numStr = t.replace(/[^0-9.]/g, '');
      if (!numStr) continue;
      const num = parseFloat(numStr);
      expect(num).toBeLessThanOrEqual(100);
    }
  });

  // ESTADO 3 — Validação
  test('mostra erro ao submeter com campo de área vazio', async ({ page }) => {
    await page.fill('input[name="fator_vidro_percent"]', '40');
    await page.fill('input[name="iluminacao_w_m2"]', '12');
    await page.fill('input[name="area_m2"]', '');
    await page.getByRole('button', { name: /calcular/i }).click();
    await expect(page.locator('.text-red-600, .text-red-500').first()).toBeVisible({ timeout: 5000 });
  });

  // ESTADO 4 — Loading
  test('botão fica disabled durante chamada à API', async ({ page }) => {
    await page.route('**/simulation/calculate_efficiency', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await route.fulfill({ status: 200, json: EFFICIENCY_MOCK_RESPONSE });
    });

    await page.fill('input[name="area_m2"]', '500');
    await page.fill('input[name="fator_vidro_percent"]', '40');
    await page.fill('input[name="iluminacao_w_m2"]', '12');
    await page.fill('input[name="ar_condicionado_cop"]', '3.5');
    await page.fill('input[name="horas_uso_dia"]', '8');
    await page.fill('input[name="dias_uso_ano"]', '250');
    await page.getByRole('button', { name: /calcular/i }).click();

    await expect(page.getByRole('button', { name: /calcular/i })).toBeDisabled();
  });

  // ESTADO 5 — Pós-resultado
  test('botão de download PDF aparece após cálculo', async ({ page }) => {
    await page.route('**/simulation/calculate_efficiency', async (route) => {
      await route.fulfill({ status: 200, json: EFFICIENCY_MOCK_RESPONSE });
    });

    await page.fill('input[name="area_m2"]', '500');
    await page.fill('input[name="fator_vidro_percent"]', '40');
    await page.fill('input[name="iluminacao_w_m2"]', '12');
    await page.fill('input[name="ar_condicionado_cop"]', '3.5');
    await page.fill('input[name="horas_uso_dia"]', '8');
    await page.fill('input[name="dias_uso_ano"]', '250');
    await page.getByRole('button', { name: /calcular/i }).click();

    await expect(page.locator('text=72').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /avançar|documento|pdf|memorial|baixar/i }).first()).toBeVisible({ timeout: 5000 });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// MÓDULO 3 — HVAC COMPLETO
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Módulo HVAC Completo — Cobertura Completa', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await navigateToModule(page, 'HVAC Completo');
  });

  // ESTADO 1 — Carregamento inicial
  test('exibe todos os campos obrigatórios ao carregar', async ({ page }) => {
    await expect(page.locator('#area')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#pe_direito')).toBeVisible();
    await expect(page.locator('#pessoas')).toBeVisible();
  });

  test('botão Calcular está visível e habilitado por padrão', async ({ page }) => {
    await expect(page.getByRole('button', { name: /calcular/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /calcular/i })).toBeEnabled();
  });

  // ESTADO 2 — Happy path
  test('calcula e exibe carga térmica e dimensionamento de duto', async ({ page }) => {
    await page.route('**/simulation/calculate_hvac_complete', async (route) => {
      await route.fulfill({ status: 200, json: HVAC_COMPLETE_MOCK_RESPONSE });
    });

    await page.fill('#area', '50');
    await page.fill('#pe_direito', '2.70');
    await page.fill('#pessoas', '4');
    await page.fill('#equipamentos', '2');
    await page.fill('#watts', '200');

    await page.getByRole('button', { name: /calcular/i }).click();

    // Carga térmica total deve aparecer
    await expect(page.locator('text=24.000').first()).toBeVisible({ timeout: 10000 });
    // Sugestão de equipamento
    await expect(page.locator('text=Split').first()).toBeVisible();
  });

  test('resultado inclui dimensionamento de duto (m³/h ou mm)', async ({ page }) => {
    await page.route('**/simulation/calculate_hvac_complete', async (route) => {
      await route.fulfill({ status: 200, json: HVAC_COMPLETE_MOCK_RESPONSE });
    });

    await page.fill('#area', '50');
    await page.fill('#pe_direito', '2.70');
    await page.fill('#pessoas', '4');
    await page.fill('#equipamentos', '0');
    await page.fill('#watts', '0');
    await page.getByRole('button', { name: /calcular/i }).click();

    // Deve mostrar pelo menos um valor de duto
    await expect(page.locator('text=480').first()).toBeVisible({ timeout: 10000 });
  });

  // ESTADO 3 — Validação
  test('mostra erro ao submeter com campo de área vazio', async ({ page }) => {
    await page.fill('#pe_direito', '2.70');
    await page.fill('#pessoas', '3');
    await page.fill('#area', '');
    await page.getByRole('button', { name: /calcular/i }).click();
    await expect(page.locator('.text-red-600, .text-red-500').first()).toBeVisible({ timeout: 5000 });
  });

  // ESTADO 4 — Loading
  test('botão fica disabled durante chamada à API', async ({ page }) => {
    await page.route('**/simulation/calculate_hvac_complete', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await route.fulfill({ status: 200, json: HVAC_COMPLETE_MOCK_RESPONSE });
    });

    await page.fill('#area', '50');
    await page.fill('#pe_direito', '2.70');
    await page.fill('#pessoas', '4');
    await page.fill('#equipamentos', '0');
    await page.fill('#watts', '0');
    await page.getByRole('button', { name: /calcular/i }).click();

    await expect(page.getByRole('button', { name: /calcular/i })).toBeDisabled();
  });

  // ESTADO 5 — Pós-resultado
  test('botão de download PDF aparece após cálculo completo', async ({ page }) => {
    await page.route('**/simulation/calculate_hvac_complete', async (route) => {
      await route.fulfill({ status: 200, json: HVAC_COMPLETE_MOCK_RESPONSE });
    });

    await page.fill('#area', '50');
    await page.fill('#pe_direito', '2.70');
    await page.fill('#pessoas', '4');
    await page.fill('#equipamentos', '0');
    await page.fill('#watts', '0');
    await page.getByRole('button', { name: /calcular/i }).click();

    await expect(page.locator('text=24.000').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /avançar|documento|pdf|memorial|baixar/i }).first()).toBeVisible({ timeout: 5000 });
  });

  test('erro de API exibe mensagem em português e não deixa tela em branco', async ({ page }) => {
    const dialogPromise = page.waitForEvent('dialog');
    page.once('dialog', dialog => dialog.dismiss());

    await page.route('**/simulation/calculate_hvac_complete', async (route) => {
      await route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    await page.fill('#area', '50');
    await page.fill('#pe_direito', '2.70');
    await page.fill('#pessoas', '4');
    await page.fill('#equipamentos', '0');
    await page.fill('#watts', '0');
    await page.getByRole('button', { name: /calcular/i }).click();

    const dialog = await dialogPromise;
    expect(dialog.message()).toMatch(/falha|erro|conexão|tente novamente/i);

    // Formulário ainda deve estar visível (não tela em branco)
    await expect(page.locator('#area')).toBeVisible();
  });
});
