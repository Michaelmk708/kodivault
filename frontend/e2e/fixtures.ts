import { test as base, expect, type Page } from '@playwright/test';

// Use the actual 'Page' type instead of 'any'
type AuthFixture = {
  tenantPage: Page;
  landlordPage: Page;
  adminPage: Page;
};

export const test = base.extend<AuthFixture>({
  tenantPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Login as tenant
    await page.goto('/login');
    await page.fill('input[type="email"]', 'tenant@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Login")');
    await page.waitForNavigation();
    
    await use(page);
    await context.close();
  },

  landlordPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Login as landlord
    await page.goto('/login');
    await page.fill('input[type="email"]', 'landlord@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Login")');
    await page.waitForNavigation();
    
    await use(page);
    await context.close();
  },

  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Login")');
    await page.waitForNavigation();
    
    await use(page);
    await context.close();
  },
});

export { expect };