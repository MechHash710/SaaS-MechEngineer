import { test, expect } from '@playwright/test';

/**
 * FeedbackWidget — Cobertura E2E Completa
 *
 * O widget é renderizado apenas para usuários autenticados (dentro de ProtectedRoute).
 * Todos os testes registram um usuário único, fazem login e testam o widget.
 * A chamada POST /feedback/submit é mockada via page.route() para não depender do DB.
 */

const TEST_PASSWORD = 'senha123!';

/** Registra um usuário único e retorna para '/' já autenticado. */
async function loginAsNewUser(page: import('@playwright/test').Page) {
  // Mock calls when backend is unavailable
  await page.route('**/auth/register', async (route) => {
    await route.fulfill({ status: 201, json: { email: 'mock@test.com', id: 1 } });
  });
  await page.route('**/auth/login', async (route) => {
    await route.fulfill({ status: 200, json: { access_token: 'fake', token_type: 'bearer' } });
  });
  await page.route('**/auth/me', async (route) => {
    await route.fulfill({ status: 200, json: { email: 'mock@test.com', name: 'Feedback Tester' } });
  });

  const email = `fb_test_${Date.now()}@test.com`;
  await page.goto('/?mode=register');
  await page.getByLabel('Nome Completo').fill('Feedback Tester');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(TEST_PASSWORD);
  await page.getByLabel('Confirmar Senha').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'Criar Conta' }).click();

  await Promise.race([
    page.waitForURL('**/onboarding**', { timeout: 10000 }),
    page.waitForURL((url) => !url.search.includes('mode=register'), { timeout: 10000 }),
  ]).catch(() => {});

  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Sair' })).toBeVisible({ timeout: 15000 });
}

test.describe('FeedbackWidget — Cobertura Completa', () => {

  test('botão flutuante de feedback é visível após login', async ({ page }) => {
    await loginAsNewUser(page);
    await expect(page.locator('#feedback-widget-btn')).toBeVisible();
    await expect(page.locator('#feedback-widget-btn')).toContainText('Feedback');
  });

  test('modal abre ao clicar no botão de feedback', async ({ page }) => {
    await loginAsNewUser(page);
    await page.click('#feedback-widget-btn');
    await expect(page.locator('text=Enviar Feedback')).toBeVisible();
    // Deve exibir o seletor de estrelas
    await expect(page.locator('#star-1')).toBeVisible();
    await expect(page.locator('#star-5')).toBeVisible();
    // Deve exibir os botões de categoria
    await expect(page.locator('#category-bug')).toBeVisible();
    await expect(page.locator('#category-sugestao')).toBeVisible();
    await expect(page.locator('#category-elogio')).toBeVisible();
    // Deve exibir o textarea de mensagem
    await expect(page.locator('#feedback-message')).toBeVisible();
    // Deve exibir o botão de envio
    await expect(page.locator('#feedback-submit-btn')).toBeVisible();
    await expect(page.locator('#feedback-submit-btn')).toContainText('Enviar Feedback');
  });

  test('submit sem rating mostra erro de validação em português', async ({ page }) => {
    await loginAsNewUser(page);
    await page.click('#feedback-widget-btn');
    // Clica em enviar sem selecionar nenhuma estrela
    await page.click('#feedback-submit-btn');
    await expect(page.locator('text=Selecione uma avaliação de 1 a 5 estrelas.')).toBeVisible();
  });

  test('submit desabilitado enquanto loading (prevenção de double-submit)', async ({ page }) => {
    await loginAsNewUser(page);

    // Mock para resposta lenta — garante tempo para verificar estado de loading
    await page.route('**/feedback/submit', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock-id',
          rating: 4,
          category: 'sugestao',
          message: null,
          page: '/',
          created_at: new Date().toISOString(),
        }),
      });
    });

    await page.click('#feedback-widget-btn');
    await page.click('#star-4');
    await page.click('#feedback-submit-btn');

    // Botão deve estar desabilitado e mostrar "Enviando..." durante o loading
    await expect(page.locator('#feedback-submit-btn')).toBeDisabled();
    await expect(page.locator('#feedback-submit-btn')).toContainText('Enviando...');
  });

  test('happy path — envia feedback e exibe confirmação de sucesso', async ({ page }) => {
    await loginAsNewUser(page);

    // Mock da API de feedback
    await page.route('**/feedback/submit', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock-fb-001',
          rating: 5,
          category: 'elogio',
          message: 'Excelente plataforma!',
          page: '/',
          created_at: new Date().toISOString(),
        }),
      });
    });

    await page.click('#feedback-widget-btn');

    // Selecionar 5 estrelas
    await page.click('#star-5');

    // Selecionar categoria elogio
    await page.click('#category-elogio');

    // Preencher mensagem
    await page.fill('#feedback-message', 'Excelente plataforma!');

    // Enviar
    await page.click('#feedback-submit-btn');

    // Modal de sucesso deve aparecer com emoji e texto de agradecimento
    await expect(page.locator('text=🎉')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Obrigado pelo feedback!')).toBeVisible();
    await expect(page.locator('text=Sua opinião é muito importante para nós.')).toBeVisible();
  });

  test('modal fecha ao clicar no botão X', async ({ page }) => {
    await loginAsNewUser(page);
    await page.click('#feedback-widget-btn');

    // Modal deve estar aberto
    await expect(page.locator('#feedback-close-btn')).toBeVisible();
    await page.click('#feedback-close-btn');

    // Modal deve desaparecer
    await expect(page.locator('#feedback-close-btn')).not.toBeVisible();
  });

  test('erro de API exibe mensagem de erro em português', async ({ page }) => {
    await loginAsNewUser(page);

    // Mock de falha na API
    await page.route('**/feedback/submit', async (route) => {
      await route.fulfill({ status: 500, body: 'Internal Server Error' });
    });

    await page.click('#feedback-widget-btn');
    await page.click('#star-3');
    await page.click('#feedback-submit-btn');

    await expect(page.locator('text=Erro ao enviar feedback. Tente novamente.')).toBeVisible({ timeout: 5000 });
    // Botão deve voltar ao estado normal para permitir nova tentativa
    await expect(page.locator('#feedback-submit-btn')).not.toBeDisabled();
    await expect(page.locator('#feedback-submit-btn')).toContainText('Enviar Feedback');
  });

});
