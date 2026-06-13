const { BasePage } = require('./base.page');
const { expect } = require('@playwright/test');

class InventoryPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.title             = page.locator('.title');
    this.productCards      = page.locator('.inventory_item');
    this.productImages     = page.locator('.inventory_item img');
    this.productNames      = page.locator('.inventory_item_name');
    this.addToCartButtons  = page.locator('[data-test^="add-to-cart-"]');
    this.sortDropdown      = page.locator('[data-test="product-sort-container"]');
    this.cartLink          = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge         = page.locator('.shopping_cart_badge');
    this.menuButton           = page.locator('#react-burger-menu-btn');
    this.menuSidebar          = page.locator('.bm-menu-wrap');
    this.closeMenuButton      = page.locator('#react-burger-cross-btn');
    this.allItemsLink         = page.locator('[data-test="inventory-sidebar-link"]');
    this.aboutLink            = page.locator('[data-test="about-sidebar-link"]');
    this.logoutLink           = page.locator('[data-test="logout-sidebar-link"]');
    this.resetAppStateLink    = page.locator('[data-test="reset-sidebar-link"]');
  }

  /** @param {string} slug - product slug from PRODUCTS data (e.g. 'sauce-labs-backpack') */
  addToCart(slug) {
    return this.page.locator(`[data-test="add-to-cart-${slug}"]`).click();
  }

  /** @param {string} slug - product slug from PRODUCTS data */
  removeFromCart(slug) {
    return this.page.locator(`[data-test="remove-${slug}"]`).click();
  }

  /** @param {string} slug - product slug from PRODUCTS data */
  getAddToCartButton(slug) {
    return this.page.locator(`[data-test="add-to-cart-${slug}"]`);
  }

  /** @param {string} slug - product slug from PRODUCTS data */
  getRemoveButton(slug) {
    return this.page.locator(`[data-test="remove-${slug}"]`);
  }

  /** @param {'az'|'za'|'lohi'|'hilo'} option */
  async sortBy(option) {
    await this.sortDropdown.selectOption(option);
  }

  /** @returns {Promise<string[]>} */
  async getProductNames() {
    return this.page.locator('.inventory_item_name').allTextContents();
  }

  /** @returns {Promise<number[]>} */
  async getProductPrices() {
    const texts = await this.page.locator('.inventory_item_price').allTextContents();
    return texts.map(t => parseFloat(t.replace('$', '')));
  }

  /** @returns {Promise<number>} */
  async getCartCount() {
    if (await this.cartBadge.isVisible()) {
      return parseInt(await this.cartBadge.textContent());
    }
    return 0;
  }

  /**
   * @param {string} name
   * @returns {Promise<import('./product.page').ProductPage>}
   */
  async openProduct(name) {
    await this.page.locator('.inventory_item_name', { hasText: name }).click();
    const { ProductPage } = require('./product.page');
    return new ProductPage(this.page);
  }

  async openMenu() {
    await this.menuButton.click();
    await expect(this.menuSidebar).toHaveAttribute('aria-hidden', 'false');
  }

  async closeMenu() {
    await this.closeMenuButton.click();
    await expect(this.menuSidebar).toHaveAttribute('aria-hidden', 'true');
  }

  /** @returns {Promise<InventoryPage>} */
  async goToAllItems() {
    await this.allItemsLink.click();
    return this;
  }

  async openAbout() {
    await this.aboutLink.click();
  }

  async resetAppState() {
    await this.resetAppStateLink.click();
  }

  /** @returns {Promise<import('./login.page').LoginPage>} */
  async logout() {
    await this.logoutLink.click();
    const { LoginPage } = require('./login.page');
    return new LoginPage(this.page);
  }

}

module.exports = { InventoryPage };
