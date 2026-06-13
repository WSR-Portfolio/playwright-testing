const { BasePage } = require('./base.page');

class CheckoutOverviewPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.cartItems      = page.locator('.cart_item');
    this.itemNames      = page.locator('.cart_item [data-test="inventory-item-name"]');
    this.subtotalLabel  = page.locator('.summary_subtotal_label');
    this.taxLabel       = page.locator('.summary_tax_label');
    this.totalLabel     = page.locator('.summary_total_label');
    this.cancelButton   = page.locator('[data-test="cancel"]');
    this.finishButton   = page.locator('[data-test="finish"]');
  }

  /** @returns {Promise<import('./inventory.page').InventoryPage>} */
  async cancel() {
    await this.cancelButton.click();
    const { InventoryPage } = require('./inventory.page');
    return new InventoryPage(this.page);
  }

  /** @returns {Promise<import('./checkout-complete.page').CheckoutCompletePage>} */
  async finish() {
    await this.finishButton.click();
    const { CheckoutCompletePage } = require('./checkout-complete.page');
    return new CheckoutCompletePage(this.page);
  }
}

module.exports = { CheckoutOverviewPage };
