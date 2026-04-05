const { test, expect } = require('../fixtures/auth');
const { PRODUCTS } = require('../data/products');

test.describe('Hamburger menu', () => {

  test('shows all four menu items', async ({ inventoryPage }) => {
    await inventoryPage.openMenu();

    await expect(inventoryPage.allItemsLink).toBeVisible();
    await expect(inventoryPage.aboutLink).toBeVisible();
    await expect(inventoryPage.logoutLink).toBeVisible();
    await expect(inventoryPage.resetAppStateLink).toBeVisible();
  });

  test('All Items navigates to inventory from another page', async ({ page, inventoryPage }) => {
    await page.goto('/cart.html');
    await inventoryPage.openMenu();
    await inventoryPage.goToAllItems();

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.productCards).toHaveCount(6);
  });

  test('About navigates to saucelabs.com', async ({ page, inventoryPage }) => {
    await inventoryPage.openMenu();
    await inventoryPage.openAbout();

    await page.waitForURL(/saucelabs\.com/, { timeout: 10000 });
    expect(page.url()).toMatch(/saucelabs\.com/);
  });

  test.describe('Cart icon', () => {

    test('navigates to cart from inventory page', async ({ page, inventoryPage }) => {
      await inventoryPage.addToCart(PRODUCTS[0].slug);
      const cartPage = await inventoryPage.goToCart();

      await expect(page).toHaveURL(/cart\.html/);
      await expect(cartPage.cartItems).toHaveCount(1);
      await expect(cartPage.itemNames).toContainText(PRODUCTS[0].name);
    });

    test('navigates to cart from product detail page', async ({ page, inventoryPage }) => {
      await inventoryPage.addToCart(PRODUCTS[0].slug);
      const productPage = await inventoryPage.openProduct(PRODUCTS[0].name);
      const cartPage = await productPage.goToCart();

      await expect(page).toHaveURL(/cart\.html/);
      await expect(cartPage.cartItems).toHaveCount(1);
      await expect(cartPage.itemNames).toContainText(PRODUCTS[0].name);
    });

    test('navigates to cart from checkout overview', async ({ page, inventoryPage }) => {
      await inventoryPage.addToCart(PRODUCTS[0].slug);
      const cartPage1       = await inventoryPage.goToCart();
      const checkoutPage    = await cartPage1.checkout();
      const overviewPage    = await checkoutPage.fillInfo('Test', 'User', '12345');
      const cartPage2       = await overviewPage.goToCart();

      await expect(page).toHaveURL(/cart\.html/);
      await expect(cartPage2.cartItems).toHaveCount(1);
      await expect(cartPage2.itemNames).toContainText(PRODUCTS[0].name);
    });

  });

  test('Reset App State clears cart and reverts all buttons', async ({ inventoryPage }) => {
    const [item1, item2, item3] = PRODUCTS;
    await inventoryPage.addToCart(item1.slug);
    await inventoryPage.addToCart(item2.slug);
    await inventoryPage.addToCart(item3.slug);
    expect(await inventoryPage.getCartCount()).toBe(3);

    await inventoryPage.openMenu();
    await inventoryPage.resetAppState();
    await inventoryPage.closeMenu();
    await inventoryPage.page.reload();

    await expect(inventoryPage.cartBadge).not.toBeVisible();
    await expect(inventoryPage.page.locator('[data-test^="remove-"]')).toHaveCount(0);
    await expect(inventoryPage.addToCartButtons).toHaveCount(6);

    const cartPage = await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(0);
  });

  test('close button dismisses the menu', async ({ inventoryPage }) => {
    await inventoryPage.openMenu();
    await expect(inventoryPage.menuSidebar).toHaveAttribute('aria-hidden', 'false');

    await inventoryPage.closeMenu();
    await expect(inventoryPage.menuSidebar).toHaveAttribute('aria-hidden', 'true');
  });

});
