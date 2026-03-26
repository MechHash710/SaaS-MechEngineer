# Playwright Patterns & Best Practices

Este repositório estabelece os padrões e anti-padrões autorizados para uso na escrita de testes End-to-End com Playwright dentro da plataforma SaaS.

## 🚫 ANTI-PADRÕES CRÍTICOS (Proibido)

**1. Tempos Fixos de Espera**
Nunca use `waitForTimeout()`. O tempo é sempre relativo e a rede pode oscilar, causando fragilidades (flaky tests).
*❌ ERRADO:*
```typescript
await page.getByRole('button', { name: 'Calcular' }).click();
await page.waitForTimeout(3000); // FRÁGIL
await expect(page.getByText('Sucesso')).toBeVisible();
```

**2. Locators Frágeis**
Evite referenciar classes ou estrutura DOM que possam mudar facilmente.
*❌ ERRADO:*
```typescript
await page.locator('.btn-primary > div').click();
await page.locator('xpath=//div[3]/form/input').fill('100');
```

## ✅ PADRÕES RECOMENDADOS (Obrigatório)

**1. Hierarquia de Locators (Do Óbvio ao Oculto)**
Siga esta ordem rigorosamente para selecionar elementos:
1. `getByRole` (acessibilidade em 1º lugar)
2. `getByLabel`
3. `getByPlaceholder`
4. `getByText`
5. `getByTestId`
6. `locator` (Apenas quando não houver outra opção)

*✅ CORRETO:*
```typescript
await page.getByRole('button', { name: /Calcular/i }).click();
await page.getByLabel('E-mail válido').fill('teste@eng.com.br');
```

**2. Lidando com Assincronicidade Inteligente**
Use os recursos unificados de assert e wait do Web-First Assertions:
```typescript
// Aguardar o botão ficar invisível automaticamente após o envio
await expect(page.getByRole('button', { name: 'Enviando...' })).not.toBeVisible({ timeout: 10000 });

// Aguardar resposta da API ao invés de delay fixo
const responsePromise = page.waitForResponse(response => response.url().includes('/api/v1/calculate') && response.status() === 200);
await page.getByRole('button', { name: 'Calcular' }).click();
await responsePromise;
```

**3. Testando Interações Complexas (Downloads)**
PDFs devem ter o download explicitamente esperado pelo core browser runtime:
```typescript
const downloadPromise = page.waitForEvent('download');
await page.getByRole('button', { name: 'Exportar Memorial PDF' }).click();
const download = await downloadPromise;
expect(download.suggestedFilename()).toMatch(/memorial/i);
```

**4. Mocks de Respostas (Para Error States)**
```typescript
await page.route('**/api/v1/auth', route => {
  route.fulfill({
    status: 401,
    contentType: 'application/json',
    body: JSON.stringify({ detail: 'Credencial inválida' })
  });
});
```
