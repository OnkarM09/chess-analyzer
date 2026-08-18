import { test, expect } from '@playwright/test';

test('test chessboard forward button', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('input[placeholder="Enter username (e.g., hikaru)"]', 'Infinity2022Forever');
  await page.click('button:has-text("Find Games")');
  
  // Wait for games to load
  await page.waitForSelector('text=Recent Games', { timeout: 10000 });
  
  // Click the first game's Analyze button
  await page.click('button:has-text("Analyze")');
  
  // Wait for review page to load. 
  // We can just wait for the board to appear.
  await page.waitForSelector('div[data-boardmargin]', { state: 'attached', timeout: 30000 });
  
  // Click the Next button. It has a lucide-chevron-right icon.
  const nextBtn = page.locator('button').filter({ has: page.locator('.lucide-chevron-right') });
  
  const boardLocator = page.locator('div[data-boardmargin]');
  
  const boardHtml1 = await boardLocator.innerHTML();
  console.log("Initial Board HTML length:", boardHtml1.length);
  
  await nextBtn.click();
  
  // Wait for render
  await page.waitForTimeout(500);
  
  const boardHtml2 = await boardLocator.innerHTML();
  console.log("Next Board HTML length:", boardHtml2.length);
  
  expect(boardHtml1).not.toBe(boardHtml2);
});
