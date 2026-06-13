const { test: base, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login.page');
const { InventoryPage } = require('../pages/inventory.page');
const { USERS } = require('../data/users');

const test = base.extend({
  inventoryPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await use(new InventoryPage(page));
  },

  problemInventoryPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.problem.username, USERS.problem.password);
    await use(new InventoryPage(page));
  },

  glitchInventoryPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.glitch.username, USERS.glitch.password);
    await page.waitForURL('**/inventory.html', { timeout: 15000 });
    await use(new InventoryPage(page));
  },

  errorInventoryPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.error.username, USERS.error.password);
    await use(new InventoryPage(page));
  },

  visualInventoryPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.visual.username, USERS.visual.password);
    await use(new InventoryPage(page));
  },
});

module.exports = { test, expect };
