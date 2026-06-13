const { BasePage } = require('./base.page');

class CheckoutPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.firstName      = page.locator('[data-test="firstName"]');
    this.lastName       = page.locator('[data-test="lastName"]');
    this.postalCode     = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton   = page.locator('[data-test="cancel"]');
    this.finishButton   = page.locator('[data-test="finish"]');
    this.errorMessage   = page.locator('[data-test="error"]');
  }

  /** @returns {Promise<import('./cart.page').CartPage>} */
  async cancel() {
    await this.cancelButton.click();
    const { CartPage } = require('./cart.page');
    return new CartPage(this.page);
  }

  /**
   * @param {string} first
   * @param {string} last
   * @param {string} zip
   * @returns {Promise<import('./checkout-overview.page').CheckoutOverviewPage>}
   */
  async fillInfo(first, last, zip) {
    await this.firstName.fill(first);
    await this.lastName.fill(last);
    await this.postalCode.fill(zip);
    await this.continueButton.click();
    const { CheckoutOverviewPage } = require('./checkout-overview.page');
    return new CheckoutOverviewPage(this.page);
  }
}

module.exports = { CheckoutPage };
