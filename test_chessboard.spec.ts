import { test, expect } from '@playwright/test';

test('test chessboard forward button', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('input[placeholder="Enter username (e.g., hikaru)"]', 'Infinity2022Forever');
  await page.click('button:has-text("Find Games")');
  
  // Wait for games to load
  await page.waitForSelector('text=Recent Games', { timeout: 10000 });
  

  await page.waitForSelector('text=Recent Games', { timeout: 10000 });
  
  // Click Analyze
  await page.click('button:has-text("Analyze")');
  
  // Wait for the next button to appear
  const nextBtn = page.locator('button').filter({ has: page.locator('.lucide-chevron-right') }).first();
  await nextBtn.waitFor({ state: 'attached', timeout: 30000 });
  
  // Get board HTML
  const boardLocator = page.locator('[data-boardid="ReviewBoard"]');
  await boardLocator.waitFor({ state: 'attached', timeout: 10000 });
  
  const boardHtml1 = await boardLocator.innerHTML();
  console.log("Initial Board HTML length:", boardHtml1.length);
  
  await nextBtn.click();
  
  // Wait for render
  await page.waitForTimeout(1000);
  
  const boardHtml2 = await boardLocator.innerHTML();
  console.log("Next Board HTML length:", boardHtml2.length);
  
  expect(boardHtml1).not.toBe(boardHtml2);
});
