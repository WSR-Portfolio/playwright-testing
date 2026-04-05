const { test, expect } = require('../fixtures/auth');
const { PRODUCTS } = require('../data/products');

test.describe('Cart', () => {

  test('empty cart checkout button is not disabled and proceeds without items', async ({ page, inventoryPage }) => {
    const cartPage = await inventoryPage.goToCart();

    await expect(cartPage.cartItems).toHaveCount(0);

    test.info().annotations.push({
      type: 'bug',
      description: 'Checkout button is not disabled on an empty cart and proceeds to checkout-step-one.html. Should either be disabled or show a validation error.',
    });

    await expect(cartPage.checkoutButton).not.toBeDisabled();
    await cartPage.checkout();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  test('Continue Shopping returns to inventory with cart preserved', async ({ page, inventoryPage }) => {
    const product = PRODUCTS[0];

    await inventoryPage.addToCart(product.slug);
    const cartPage = await inventoryPage.goToCart();
    const backToInventory = await cartPage.continueShopping();

    await expect(page).toHaveURL(/inventory\.html/);
    expect(await backToInventory.getCartCount()).toBe(1);
  });

  test('cart shows all 6 items with correct names, quantities, and prices', async ({ inventoryPage }) => {
    for (const product of PRODUCTS) {
      await inventoryPage.addToCart(product.slug);
    }

    const cartPage = await inventoryPage.goToCart();

    await expect(cartPage.cartItems).toHaveCount(6);

    const names = await cartPage.itemNames.allTextContents();
    expect(names.slice().sort()).toEqual(PRODUCTS.map(p => p.name).slice().sort());

    await expect(cartPage.itemQuantities).toHaveText(['1', '1', '1', '1', '1', '1']);

    const prices = await cartPage.itemPrices.allTextContents();
    const actualPrices   = prices.map(p => parseFloat(p.replace('$', ''))).sort((a, b) => a - b);
    const expectedPrices = PRODUCTS.map(p => p.price).sort((a, b) => a - b);
    expect(actualPrices).toEqual(expectedPrices);

    const descs = await cartPage.itemDescriptions.allTextContents();
    expect(descs.every(d => d.trim().length > 0)).toBe(true);
  });

  test('removing from cart page updates badge and keeps remaining item', async ({ inventoryPage }) => {
    const [item1, item2] = PRODUCTS;

    await inventoryPage.addToCart(item1.slug);
    await inventoryPage.addToCart(item2.slug);

    const cartPage = await inventoryPage.goToCart();
    await cartPage.removeItem(item1.slug);

    await expect(cartPage.cartItems).toHaveCount(1);
    expect(await cartPage.getCartCount()).toBe(1);
    await expect(cartPage.itemNames).toContainText(item2.name);
  });

  test('removing from inventory decrements badge and removes item from cart', async ({ inventoryPage }) => {
    const [item1, item2, item3] = PRODUCTS;

    await inventoryPage.addToCart(item1.slug);
    await inventoryPage.addToCart(item2.slug);
    await inventoryPage.addToCart(item3.slug);
    expect(await inventoryPage.getCartCount()).toBe(3);

    await inventoryPage.removeFromCart(item2.slug);

    await expect(inventoryPage.getAddToCartButton(item2.slug)).toBeVisible();
    expect(await inventoryPage.getCartCount()).toBe(2);

    const cartPage = await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(2);
    const cartNames = await cartPage.itemNames.allTextContents();
    expect(cartNames).not.toContain(item2.name);
  });

  test('adding from product detail page updates badge and shows Remove on inventory', async ({ inventoryPage }) => {
    const product = PRODUCTS[0]; // Sauce Labs Backpack

    const productPage = await inventoryPage.openProduct(product.name);
    await productPage.addToCart();

    await expect(productPage.removeButton).toBeVisible();
    expect(await productPage.getCartCount()).toBe(1);

    const backToInventory = await productPage.goBack();
    await expect(backToInventory.getRemoveButton(product.slug)).toBeVisible();
  });

  test('adding all 6 items increments badge and changes button to Remove', async ({ inventoryPage }) => {
    for (let i = 0; i < PRODUCTS.length; i++) {
      const product = PRODUCTS[i];
      await inventoryPage.addToCart(product.slug);
      await expect(inventoryPage.getRemoveButton(product.slug)).toBeVisible();
      expect(await inventoryPage.getCartCount()).toBe(i + 1);
    }

    expect(await inventoryPage.getCartCount()).toBe(6);
  });

});
