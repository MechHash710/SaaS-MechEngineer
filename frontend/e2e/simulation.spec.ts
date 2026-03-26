import { test, expect } from '@playwright/test';

test.describe('Formulário Solar Simulator — Cobertura Completa QA', () => {

  test.beforeEach(async ({ page }) => {
    // Injeta token para passar pelo AuthContext local check
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('@EngenhariaPro:token', 'fake-token'));
    
    // Mock authentication
    await page.route('**/auth/me', async (route) => {
      await route.fulfill({ status: 200, json: { email: 'qatester@valido.com', name: 'QA' } });
    });
    
    // Acessa o dashboard já autenticado
    await page.goto('/?mode=dashboard');
    
    // Clica no card de Aquecimento Solar
    await page.getByRole('button', { name: /Aquecimento Solar/i }).click();
  });

  // ESTADO 1 — Carregamento Inicial (UI Completa e Tipografia)
  test('exibe todos os campos com unidades de engenharia nos labels', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Localização da Obra' })).toBeVisible();
    
    // Assegura que inputs contêm unidades via placeholders ou labels acessíveis
    await expect(page.getByLabel('Cidade e Estado')).toBeVisible();
    await expect(page.getByLabel('Moradores / Ocupantes')).toBeVisible();
    await expect(page.getByLabel('Consumo Médio por Pessoa')).toBeVisible();
    await expect(page.locator('text=L/dia')).toBeVisible();
    await expect(page.locator('text=°C').first()).toBeVisible();

    await expect(page.getByRole('button', { name: 'Calcular Sistema de Aquecimento Solar' })).toBeEnabled();
  });

  // ESTADO 3 — Validação
  test('mostra erro nativo/schema ao esvaziar campo numérico obrigatório', async ({ page }) => {
    await page.getByLabel('Moradores / Ocupantes').fill('');
    await page.getByRole('button', { name: 'Calcular Sistema de Aquecimento Solar' }).click();
    
    // Supondo validação nativa ou do schema zor "Esperado number" / "Obrigatório"
    await expect(page.locator('.text-red-600').first()).toBeVisible();
  });

  // ESTADO 4 — Loading
  test('botão fica disabled e mostra texto de processamento durante chamada de API', async ({ page }) => {
    // Mock do endpoint do simulador demorando 1 segundo
    await page.route('**/simulation/calculate_solar', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({ 
        status: 200, 
        json: { 
          project_id: "SOLAR-123", 
          volume_boiler_l: 200,
          area_coletores_m2: 2.4,
          economia_anual_brl: 600,
          fracao_solar: 0.6,
          energia_necessaria_kwh_dia: 5.5,
          consumo_diario_l: 150,
          num_coletores: 1,
          economia_mensal_kwh: 60,
          recomendacao_sistema: "N/A",
          references: [],
          constants_used: {},
          step_by_step: {
            "Volume Reservatório": "200 L",
            "Área Coletora": "2.4 m²"
          }
        } 
      });
    });

    await page.getByLabel('Cidade e Estado').fill('São Paulo, SP');
    await page.getByRole('button', { name: 'Calcular Sistema de Aquecimento Solar' }).click();

    // Bloqueia multi-click
    await expect(page.getByRole('button', { name: /Processando/i })).toBeDisabled();
    // Exige SVG de Spinner
    await expect(page.locator('svg.animate-spin')).toBeVisible();
  });

  // ESTADO 2 e 5 — Happy Path e Download PDF (Resultado)
  test('calcula com dados válidos, mostra AuditSteps e verifica engine de PDF', async ({ page }) => {
    await page.route('**/simulation/calculate_solar', async (route) => {
      await route.fulfill({ 
        status: 200, 
        json: { 
          project_id: "SOLAR-PERFECT", 
          volume_boiler_l: 400,
          area_coletores_m2: 4.8,
          economia_anual_brl: 1200,
          fracao_solar: 0.8,
          energia_necessaria_kwh_dia: 11.2,
          consumo_diario_l: 300,
          num_coletores: 2,
          economia_mensal_kwh: 120,
          recomendacao_sistema: "Sistema validado.",
          references: ["NBR 15569"],
          constants_used: { "Eficiência": "60%" },
          step_by_step: {
            "Volume Reservatório": "400 L"
          }
        } 
      });
    });

    // Intercepta a rota do PDF para que não dê tela de erro se FastAPI backend crashar local
    await page.route('**/documents/memorial/solar', async (route) => {
      // Mock devolvendo um dummy de PDF
      await route.fulfill({ status: 200, contentType: 'application/pdf', body: 'fake-pdf-content' });
    });

    await page.getByLabel('Cidade e Estado').fill('Curitiba, PR');
    // Submete
    await page.getByRole('button', { name: 'Calcular Sistema de Aquecimento Solar' }).click();

    // UI deve atualizar com a aba de Resumo ativa por padrão
    await expect(page.getByText('Volume Boiler')).toBeVisible();
    
    // Navegar para a aba de Auditoria
    await page.getByRole('button', { name: 'Revisão Técnica' }).click();
    await expect(page.getByText('Memorial Matemático AQS (NBR 15569)')).toBeVisible();
    await expect(page.getByText('Volume Reservatório')).toBeVisible();
    await expect(page.getByText('NBR 15569').first()).toBeVisible();

    // Voltar para a aba de Resumo para exportar o PDF
    await page.getByRole('button', { name: 'Resumo do Dimensionamento' }).click();

    // Preencher Lead info necessário no frontend
    await page.getByPlaceholder('Seu Nome ou Empresa').fill('Engenheiro QA');
    await page.getByPlaceholder('E-mail').fill('qa@teste.com');
    await page.getByPlaceholder('Telefone / WhatsApp').fill('11999999999');

    // Ir para Step 3 (Relatórios)
    await page.getByRole('button', { name: /Exportar Relatório Auditável/i }).click(); 
    
    // Validar UI do Step 3
    await expect(page.getByText('Memorial de Cálculo de AQS')).toBeVisible();

    // E2E Download do PDF Memorial
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Baixar Memorial PDF' }).click();

    const download = await downloadPromise;
    // O PDF deve conter o nome do lead, confirmando integração
    expect(download.suggestedFilename()).toContain('memorial_solar_Engenheiro_QA');
  });

});
