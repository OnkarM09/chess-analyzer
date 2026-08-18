# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: test_chessboard.spec.ts >> test chessboard forward button
- Location: test_chessboard.spec.ts:3:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('div[data-boardmargin]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - link "ChessCoach" [ref=e6] [cursor=pointer]:
            - /url: /
          - navigation [ref=e8]:
            - link "Games" [ref=e9] [cursor=pointer]:
              - /url: /games
            - link "Profile" [ref=e10] [cursor=pointer]:
              - /url: /profile
            - link "Training" [ref=e11] [cursor=pointer]:
              - /url: /training
        - button "Toggle theme" [ref=e13]
    - main [ref=e14]:
      - generic [ref=e15]:
        - alert [ref=e16]:
          - heading "Something went wrong!" [level=5] [ref=e19]
          - generic [ref=e20]: "Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports. Check the render method of `Piece`."
        - button "Try again" [ref=e21]
    - contentinfo [ref=e22]:
      - generic [ref=e23]:
        - paragraph [ref=e24]: Built for chess players to improve their game. Not affiliated with Chess.com.
        - generic [ref=e25]:
          - link "Licenses" [ref=e26] [cursor=pointer]:
            - /url: /licenses
          - link "GitHub" [ref=e27] [cursor=pointer]:
            - /url: https://github.com
  - generic [ref=e32] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e33]
    - generic [ref=e37]:
      - button "Open issues overlay" [ref=e38]:
        - generic [ref=e39]:
          - generic [ref=e40]: "0"
          - generic [ref=e41]: "1"
        - generic [ref=e42]: Issue
      - button "Collapse issues badge" [ref=e43]
  - alert [ref=e46]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('test chessboard forward button', async ({ page }) => {
  4  |   await page.goto('http://localhost:3000');
  5  |   await page.fill('input[placeholder="Enter username (e.g., hikaru)"]', 'Infinity2022Forever');
  6  |   await page.click('button:has-text("Find Games")');
  7  |   
  8  |   // Wait for games to load
  9  |   await page.waitForSelector('text=Recent Games', { timeout: 10000 });
  10 |   
  11 |   // Click the first game's Analyze button
  12 |   await page.click('button:has-text("Analyze")');
  13 |   
  14 |   // Wait for review page to load. 
  15 |   // We can just wait for the board to appear.
> 16 |   await page.waitForSelector('div[data-boardmargin]', { state: 'attached', timeout: 30000 });
     |              ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  17 |   
  18 |   // Click the Next button. It has a lucide-chevron-right icon.
  19 |   const nextBtn = page.locator('button').filter({ has: page.locator('.lucide-chevron-right') });
  20 |   
  21 |   const boardLocator = page.locator('div[data-boardmargin]');
  22 |   
  23 |   const boardHtml1 = await boardLocator.innerHTML();
  24 |   console.log("Initial Board HTML length:", boardHtml1.length);
  25 |   
  26 |   await nextBtn.click();
  27 |   
  28 |   // Wait for render
  29 |   await page.waitForTimeout(500);
  30 |   
  31 |   const boardHtml2 = await boardLocator.innerHTML();
  32 |   console.log("Next Board HTML length:", boardHtml2.length);
  33 |   
  34 |   expect(boardHtml1).not.toBe(boardHtml2);
  35 | });
  36 | 
```