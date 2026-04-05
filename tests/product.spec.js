const { test, expect } = require('../fixtures/auth');
const { PRODUCTS } = require('../data/products');

test.describe('Product detail page', () => {

  PRODUCTS.forEach(product => {
    test(`shows correct data for ${product.name}`, async ({ inventoryPage }) => {
      const productPage = await inventoryPage.openProduct(product.name);

      await expect(productPage.name).toHaveText(product.name);
      await expect(productPage.description).toBeVisible();
      await expect(productPage.price).toHaveText(`$${product.price.toFixed(2)}`);
      await expect(productPage.addToCartButton).toBeVisible();

      const backToInventory = await productPage.goBack();
      await expect(backToInventory.title).toHaveText('Products');
      await expect(backToInventory.productCards).toHaveCount(6);
    });
  });

});
