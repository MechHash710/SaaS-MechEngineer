import { test, expect } from '@playwright/test';

test.describe('Autenticação e Registro — Cobertura Completa dos 5 Estados', () => {

  test.describe('Formulário de Login', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/?mode=login');
    });

    // ESTADO 1 — Carregamento Inicial
    test('exibe todos os campos obrigatórios e botão inicial habilitado', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Entrar na plataforma' })).toBeVisible();
      await expect(page.getByLabel('E-mail')).toBeVisible();
      await expect(page.getByLabel('Senha')).toBeVisible();
      await expect(page.getByLabel('Lembrar-me')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Entrar' })).toBeEnabled();
    });

    // ESTADO 3 — Validação (Invalid Path)
    test('mostra erro em PT-BR ao submeter formulário vazio', async ({ page }) => {
      await page.getByRole('button', { name: 'Entrar' }).click();
      await expect(page.getByText('E-mail inválido')).toBeVisible();
      await expect(page.getByText('Senha obrigatória')).toBeVisible();
    });

    test('mostra erro da API ao usar credencial incorreta', async ({ page }) => {
      // Mockando a resposta de falha da API conforme padrões UX
      await page.route('**/auth/login', async (route) => {
        await route.fulfill({ status: 401, json: { detail: 'E-mail ou senha incorretos.' } });
      });

      await page.getByLabel('E-mail').fill('usuario@errado.com');
      await page.getByLabel('Senha').fill('senha123');
      await page.getByRole('button', { name: 'Entrar' }).click();

      // Asserção explicitamente visual do aviso em vermelho (Estado Resultado de Erro)
      await expect(page.getByText('E-mail ou senha incorretos.')).toBeVisible();
    });

    // ESTADO 4 — Loading UI (Prevenção Multi-click)
    test('botão exibe estado de loading durante processamento lento', async ({ page }) => {
      await page.route('**/auth/login', async (route) => {
        // Atraso intencional para capturar o state de loading sem waitForTimeout flaco
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({ status: 200, json: { access_token: 'fake', token_type: 'bearer' } });
      });

      await page.getByLabel('E-mail').fill('teste@eng.com');
      await page.getByLabel('Senha').fill('senha123');
      await page.getByRole('button', { name: 'Entrar' }).click();

      // Botão deve estar desabilitado e com classe/estado indicando loading
      await expect(page.getByRole('button')).toBeDisabled();
      const svgSpinner = page.locator('button svg.animate-spin');
      await expect(svgSpinner).toBeVisible();
    });

    // ESTADO 2 e 5 — Happy Path e Redirecionamento (Resultado)
    test('login com sucesso redireciona para o dashboard', async ({ page }) => {
      await page.route('**/auth/login', async (route) => {
        await route.fulfill({ status: 200, json: { access_token: 'valid_token', token_type: 'bearer' } });
      });
      await page.route('**/auth/me', async (route) => {
        await route.fulfill({ status: 200, json: { email: 'teste@eng.com', name: 'Engenheiro Teste' } });
      });

      await page.getByLabel('E-mail').fill('teste@eng.com');
      await page.getByLabel('Senha').fill('senha123');

      // Esperar que a navegação aconteça, garantindo o redirect correto (Sem timeouts arbitrários)
      const redirectPromise = page.waitForURL('**/?mode=dashboard');
      await page.getByRole('button', { name: 'Entrar' }).click();
      await redirectPromise;

      await expect(page.url()).toContain('mode=dashboard');
    });
  });

  test.describe('Formulário de Registro', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/?mode=register');
    });

    // ESTADO 1 — Carregamento Inicial
    test('exibe labels de registro e botão habilitado por padrão', async ({ page }) => {
      await expect(page.getByLabel('Nome Completo')).toBeVisible();
      await expect(page.getByLabel('E-mail')).toBeVisible();
      await expect(page.getByLabel('Senha', { exact: true })).toBeVisible();
      await expect(page.getByLabel('Confirmar Senha')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Criar Conta' })).toBeEnabled();
    });

    // ESTADO 3 — Validações Estritas
    test('bloqueia se as senhas não conferem', async ({ page }) => {
      await page.getByLabel('Nome Completo').fill('Mecânico Júnior');
      await page.getByLabel('E-mail').fill('mec@eng.com');
      await page.getByLabel('Senha', { exact: true }).fill('senhaForte123');
      await page.getByLabel('Confirmar Senha').fill('senhaDiferente');
      await page.getByRole('button', { name: 'Criar Conta' }).click();

      await expect(page.getByText('Senhas não conferem')).toBeVisible();
    });
  });
});
