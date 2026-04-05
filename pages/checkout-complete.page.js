const { BasePage } = require('./base.page');

class CheckoutCompletePage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.header         = page.locator('[data-test="complete-header"]');
    this.text           = page.locator('[data-test="complete-text"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  /** @returns {Promise<import('./inventory.page').InventoryPage>} */
  async backHome() {
    await this.backHomeButton.click();
    const { InventoryPage } = require('./inventory.page');
    return new InventoryPage(this.page);
  }
}

module.exports = { CheckoutCompletePage };
