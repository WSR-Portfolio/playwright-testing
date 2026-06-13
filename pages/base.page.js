class BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page     = page;
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
  }

  /** @param {string} [path='/'] */
  async goto(path = '/') {
    await this.page.goto(path);
  }

  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** @returns {Promise<import('./cart.page').CartPage>} */
  async goToCart() {
    await this.cartLink.click();
    const { CartPage } = require('./cart.page');
    return new CartPage(this.page);
  }
}

module.exports = { BasePage };
