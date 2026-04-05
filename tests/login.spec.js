const { test, expect } = require('../fixtures/auth');
const { LoginPage } = require('../pages/login.page');
const { USERS } = require('../data/users');

test.describe('Login', () => {

  test('standard user can log in', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    const inventoryPage = await loginPage.login(USERS.standard.username, USERS.standard.password);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.productCards).toHaveCount(6);
  });

  test('wrong password shows invalid credentials error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, 'wrongpassword');

    await expect(loginPage.errorMessage).toHaveText(
      'Epic sadface: Username and password do not match any user in this service'
    );
  });

  test('username only shows password required error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.standard.username, '');

    await expect(loginPage.errorMessage).toHaveText('Epic sadface: Password is required');
  });

  test('empty credentials show username required error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('', '');

    await expect(loginPage.errorMessage).toHaveText('Epic sadface: Username is required');
    await expect(loginPage.usernameErrorIcon).toBeVisible();
  });

  test('logout clears cart state', async ({ inventoryPage }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');
    expect(await inventoryPage.getCartCount()).toBe(2);

    await inventoryPage.openMenu();
    await inventoryPage.resetAppState();
    const loginPage = await inventoryPage.logout();

    const freshInventory = await loginPage.login(USERS.standard.username, USERS.standard.password);
    expect(await freshInventory.getCartCount()).toBe(0);

    const cartPage = await freshInventory.goToCart();
    await expect(cartPage.cartItems).toHaveCount(0);
  });

  test('standard user can log out and session is cleared', async ({ page, inventoryPage }) => {
    await inventoryPage.openMenu();
    await expect(inventoryPage.menuSidebar).toHaveAttribute('aria-hidden', 'false');
    await expect(inventoryPage.logoutLink).toBeVisible();

    const loginPage = await inventoryPage.logout();
    await expect(page).toHaveURL('/');
    await expect(loginPage.loginButton).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL('/');
    await expect(loginPage.loginButton).toBeVisible();
  });

  const protectedRoutes = ['/inventory.html', '/cart.html', '/checkout-step-one.html'];

  protectedRoutes.forEach(route => {
    test(`direct access to ${route} redirects to login`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await page.goto(route);

      await expect(page).toHaveURL('/');
      await expect(loginPage.loginButton).toBeVisible();
    });
  });

  test('locked out user sees error and stays on login page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(USERS.locked.username, USERS.locked.password);

    await expect(page).toHaveURL('/');
    await expect(loginPage.errorMessage).toHaveText(
      'Epic sadface: Sorry, this user has been locked out.'
    );
  });

});
