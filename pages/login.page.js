const { BasePage } = require('./base.page');

class LoginPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton        = page.locator('[data-test="login-button"]');
    this.errorMessage       = page.locator('[data-test="error"]');
    this.usernameErrorIcon  = page.locator('[data-test="username"] ~ .error_icon');
  }

  /**
   * @param {string} username
   * @param {string} password
   * @returns {Promise<import('./inventory.page').InventoryPage>}
   */
  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    const { InventoryPage } = require('./inventory.page');
    return new InventoryPage(this.page);
  }
}

module.exports = { LoginPage };
