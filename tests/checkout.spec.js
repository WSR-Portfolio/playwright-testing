const { test, expect } = require('../fixtures/auth');
const { PRODUCTS, EXPECTED_ITEM_TOTAL } = require('../data/products');

const parseDollars = text => parseFloat(text.replace(/[^0-9.]/g, ''));

test.describe('Checkout', () => {

  test.describe('Performance glitch user', () => {

    test('checkout completes with documented step delays', async ({ page, glitchInventoryPage }) => {
      const timings = {};
      let start;

      start = Date.now();
      for (const product of PRODUCTS) {
        await glitchInventoryPage.addToCart(product.slug);
      }
      timings['add all items'] = Date.now() - start;

      start = Date.now();
      const cartPage = await glitchInventoryPage.goToCart();
      timings['navigate to cart'] = Date.now() - start;

      start = Date.now();
      const checkoutPage = await cartPage.checkout();
      timings['cart → step 1'] = Date.now() - start;

      start = Date.now();
      const overviewPage = await checkoutPage.fillInfo('Test', 'User', '12345');
      timings['step 1 → overview'] = Date.now() - start;

      start = Date.now();
      const completePage = await overviewPage.finish();
      timings['overview → complete'] = Date.now() - start;

      test.info().annotations.push({
        type: 'perf',
        description: 'Login delay documented separately in inventory.spec.js. Checkout step timings: ' +
          Object.entries(timings).map(([step, ms]) => `${step}: ${ms}ms`).join(' | '),
      });

      await expect(page).toHaveURL(/checkout-complete\.html/);
      await expect(completePage.header).toHaveText('Thank you for your order!');
    });

  });

  test.describe('Problem user', () => {

    test('last name field drops input causing checkout to fail', async ({ problemInventoryPage }) => {
      await problemInventoryPage.addToCart(PRODUCTS[1].slug);

      const cartPage     = await problemInventoryPage.goToCart();
      const checkoutPage = await cartPage.checkout();
      await checkoutPage.fillInfo('Test', 'User', '12345');

      // The defect is more specific than "last name drops input" —
      // keystrokes typed into Last Name are redirected into First Name instead.
      // So First Name ends up with the last name value ('User') and Last Name stays empty.
      test.info().annotations.push({
        type: 'bug',
        description: 'Last Name field redirects keystrokes into First Name for problem_user. Typing "User" into Last Name causes First Name to become "User" while Last Name stays empty. Continue fails with "Last Name is required."',
      });

      await expect(checkoutPage.firstName).toHaveValue('User');
      await expect(checkoutPage.lastName).toHaveValue('');
      await expect(checkoutPage.postalCode).toHaveValue('12345');
      await expect(checkoutPage.errorMessage).toHaveText('Error: Last Name is required');
    });

  });

  test('back home after checkout resets cart', async ({ page, inventoryPage }) => {
    await inventoryPage.addToCart(PRODUCTS[0].slug);

    const cartPage      = await inventoryPage.goToCart();
    const checkoutPage  = await cartPage.checkout();
    const overviewPage  = await checkoutPage.fillInfo('Test', 'User', '12345');
    const completePage  = await overviewPage.finish();
    const backToHome    = await completePage.backHome();

    await expect(page).toHaveURL(/inventory\.html/);
    expect(await backToHome.getCartCount()).toBe(0);
    await expect(backToHome.cartBadge).not.toBeVisible();
  });

  test('cancel on step 1 returns to cart with contents intact', async ({ page, inventoryPage }) => {
    const [item1, item2] = PRODUCTS;

    await inventoryPage.addToCart(item1.slug);
    await inventoryPage.addToCart(item2.slug);

    const cartPage     = await inventoryPage.goToCart();
    const checkoutPage = await cartPage.checkout();
    const backToCart   = await checkoutPage.cancel();

    await expect(page).toHaveURL(/cart\.html/);
    await expect(backToCart.cartItems).toHaveCount(2);
    await expect(backToCart.itemNames).toContainText([item1.name, item2.name]);
  });

  test('cancel on overview returns to inventory with cart preserved', async ({ page, inventoryPage }) => {
    const [item1, item2] = PRODUCTS;

    await inventoryPage.addToCart(item1.slug);
    await inventoryPage.addToCart(item2.slug);

    const cartPage     = await inventoryPage.goToCart();
    const checkoutPage = await cartPage.checkout();
    const overviewPage = await checkoutPage.fillInfo('Test', 'User', '12345');
    const backToInventory = await overviewPage.cancel();

    await expect(page).toHaveURL(/inventory\.html/);
    expect(await backToInventory.getCartCount()).toBe(2);
  });

  test('overview price math is correct for a known subset', async ({ inventoryPage }) => {
    const backpack = PRODUCTS.find(p => p.slug === 'sauce-labs-backpack');
    const onesie   = PRODUCTS.find(p => p.slug === 'sauce-labs-onesie');
    const expectedSubtotal = backpack.price + onesie.price;

    await inventoryPage.addToCart(backpack.slug);
    await inventoryPage.addToCart(onesie.slug);

    const cartPage      = await inventoryPage.goToCart();
    const checkoutPage  = await cartPage.checkout();
    const overviewPage  = await checkoutPage.fillInfo('Test', 'User', '12345');

    const subtotalText  = await overviewPage.subtotalLabel.textContent();
    const taxText       = await overviewPage.taxLabel.textContent();
    const totalText     = await overviewPage.totalLabel.textContent();

    const subtotal = parseDollars(subtotalText);
    const tax      = parseDollars(taxText);
    const total    = parseDollars(totalText);

    expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
    expect(tax).toBeGreaterThan(0);
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  test('non-numeric postal code is accepted without error', async ({ page, inventoryPage }) => {
    const cartPage = await inventoryPage.goToCart();
    const checkoutPage = await cartPage.checkout();
    const overviewPage = await checkoutPage.fillInfo('Test', 'User', 'ABCDE');

    test.info().annotations.push({
      type: 'bug',
      description: 'Postal code field accepts non-numeric input "ABCDE" without validation error and proceeds to checkout overview.',
    });

    await expect(checkoutPage.errorMessage).toHaveCount(0);
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(overviewPage.finishButton).toBeVisible();
  });

  test('all fields empty shows only first name error', async ({ inventoryPage }) => {
    const cartPage = await inventoryPage.goToCart();
    const checkoutPage = await cartPage.checkout();
    await checkoutPage.fillInfo('', '', '');

    await expect(checkoutPage.errorMessage).toHaveText('Error: First Name is required');
    await expect(checkoutPage.errorMessage).toHaveCount(1);
  });

  test('postal code required error on checkout step 1', async ({ inventoryPage }) => {
    const cartPage = await inventoryPage.goToCart();
    const checkoutPage = await cartPage.checkout();
    await checkoutPage.fillInfo('Test', 'User', '');

    await expect(checkoutPage.errorMessage).toHaveText('Error: Postal Code is required');
  });

  test('last name required error on checkout step 1', async ({ inventoryPage }) => {
    const cartPage = await inventoryPage.goToCart();
    const checkoutPage = await cartPage.checkout();
    await checkoutPage.fillInfo('Test', '', '12345');

    await expect(checkoutPage.errorMessage).toHaveText('Error: Last Name is required');
  });

  test('first name required error on checkout step 1', async ({ inventoryPage }) => {
    const cartPage = await inventoryPage.goToCart();
    const checkoutPage = await cartPage.checkout();
    await checkoutPage.fillInfo('', 'User', '12345');

    await expect(checkoutPage.errorMessage).toHaveText('Error: First Name is required');
  });

  test('full checkout happy path with all 6 items', async ({ page, inventoryPage }) => {
    for (const product of PRODUCTS) {
      await inventoryPage.addToCart(product.slug);
    }

    const cartPage = await inventoryPage.goToCart();
    const checkoutPage = await cartPage.checkout();
    const overviewPage = await checkoutPage.fillInfo('Test', 'User', '12345');

    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(overviewPage.cartItems).toHaveCount(6);

    const names = await overviewPage.itemNames.allTextContents();
    expect(names.slice().sort()).toEqual(PRODUCTS.map(p => p.name).slice().sort());

    const subtotalText = await overviewPage.subtotalLabel.textContent();
    const taxText      = await overviewPage.taxLabel.textContent();
    const totalText    = await overviewPage.totalLabel.textContent();

    const subtotal = parseDollars(subtotalText);
    const tax      = parseDollars(taxText);
    const total    = parseDollars(totalText);

    expect(subtotal).toBeCloseTo(EXPECTED_ITEM_TOTAL, 2);
    expect(tax).toBeGreaterThan(0);
    expect(total).toBeCloseTo(subtotal + tax, 2);

    const completePage = await overviewPage.finish();

    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(completePage.header).toHaveText('Thank you for your order!');
    await expect(completePage.text).toContainText('pony');
  });

});
