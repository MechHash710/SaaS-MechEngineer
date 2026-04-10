import { test, expect } from '@playwright/test';

// Debug test to see what exactly appears after login
test('DEBUG - capture page state after login', async ({ page }) => {
  await page.goto('/?mode=login');
  await page.fill('input[name="email"]', 'engenheiro@teste.com');
  await page.fill('input[name="password"]', 'senha123!');
  await page.click('button[type="submit"]');
  
  // Wait for the page to settle by listening for a specific selector
  await page.waitForSelector('button');
  
  // Log the current URL 
  console.log('URL after login:', page.url());
  
  // Log all button text
  const buttons = await page.locator('button').allTextContents();
  console.log('Buttons on page:', JSON.stringify(buttons));
  
  // Log page title
  console.log('Page title:', await page.title());
  
  // Log visible text (h1, h2, h3)
  const headings = await page.locator('h1, h2, h3').allTextContents();
  console.log('Headings:', JSON.stringify(headings));
});
