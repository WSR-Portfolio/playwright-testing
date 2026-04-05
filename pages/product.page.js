const { BasePage } = require('./base.page');

class ProductPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.name            = page.locator('[data-test="inventory-item-name"]');
    this.description     = page.locator('[data-test="inventory-item-desc"]');
    this.price           = page.locator('[data-test="inventory-item-price"]');
    this.addToCartButton = page.locator('[data-test^="add-to-cart"]');
    this.removeButton    = page.locator('[data-test^="remove"]');
    this.backButton      = page.locator('[data-test="back-to-products"]');
    this.cartBadge       = page.locator('.shopping_cart_badge');
  }

  async addToCart() {
    await this.addToCartButton.click();
  }

  /** @returns {Promise<number>} */
  async getCartCount() {
    if (await this.cartBadge.isVisible()) {
      return parseInt(await this.cartBadge.textContent());
    }
    return 0;
  }

  /** @returns {Promise<import('./inventory.page').InventoryPage>} */
  async goBack() {
    await this.backButton.click();
    const { InventoryPage } = require('./inventory.page');
    return new InventoryPage(this.page);
  }
}

module.exports = { ProductPage };
