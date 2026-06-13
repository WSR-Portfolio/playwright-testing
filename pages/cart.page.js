const { BasePage } = require('./base.page');

class CartPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.cartItems        = page.locator('.cart_item');
    this.itemNames        = page.locator('.cart_item [data-test="inventory-item-name"]');
    this.itemDescriptions = page.locator('.cart_item [data-test="inventory-item-desc"]');
    this.itemQuantities   = page.locator('.cart_item .cart_quantity');
    this.itemPrices       = page.locator('.cart_item [data-test="inventory-item-price"]');
    this.cartBadge              = page.locator('.shopping_cart_badge');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton         = page.locator('[data-test="checkout"]');
  }

  /** @returns {Promise<import('./inventory.page').InventoryPage>} */
  async continueShopping() {
    await this.continueShoppingButton.click();
    const { InventoryPage } = require('./inventory.page');
    return new InventoryPage(this.page);
  }

  /** @param {string} slug - product slug from PRODUCTS data */
  removeItem(slug) {
    return this.page.locator(`[data-test="remove-${slug}"]`).click();
  }

  /** @returns {Promise<number>} */
  async getCartCount() {
    if (await this.cartBadge.isVisible()) {
      return parseInt(await this.cartBadge.textContent());
    }
    return 0;
  }

  /** @returns {Promise<import('./checkout.page').CheckoutPage>} */
  async checkout() {
    await this.checkoutButton.click();
    const { CheckoutPage } = require('./checkout.page');
    return new CheckoutPage(this.page);
  }
}

module.exports = { CartPage };
