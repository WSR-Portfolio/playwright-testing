# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run all tests
npx playwright test

# Run a single test file
npx playwright test tests/login.spec.js

# Run a single test by name
npx playwright test --grep "successful login"

# Run tests with UI mode
npx playwright test --ui

# View HTML report after a run
npx playwright show-report
```

## Architecture

This is a Playwright end-to-end test suite targeting [saucedemo.com](https://www.saucedemo.com), structured with the Page Object Model (POM).

**`pages/`** — Page Object classes. `BasePage` (`pages/base.page.js`) holds shared methods (navigation, `waitForLoad`, etc.); all other page objects extend it. Each subclass defines its locators in the constructor and exposes user-action methods.

**`tests/`** — Spec files. Some tests (`login.spec.js`) use raw Playwright APIs directly; others (`checkout-pom.spec.js`) instantiate page objects from `pages/`.

**`fixtures/`** — Custom Playwright fixtures (`fixtures/auth.js`). Extends the base `test` with named fixtures (`inventoryPage`, `problemInventoryPage`, `glitchInventoryPage`) that handle login and return a ready page object. Tests import `{ test, expect }` from the fixture file instead of from `@playwright/test` directly.

**`data/`** — Static test data. `users.js` exports a frozen `USERS` object keyed by user type; `products.js` exports a frozen `PRODUCTS` array and a precomputed `EXPECTED_ITEM_TOTAL`. Import from here rather than hardcoding values in tests or page objects. `Object.freeze()` is used in place of TypeScript's `as const`.

**`playwright.config.js`** — Single project (Chromium), `baseURL` set to `https://www.saucedemo.com`, HTML + list reporters, screenshots and video on failure, `retries: process.env.CI ? 2 : 0`.

## Page Object Conventions

1. **Locators are properties, not methods.** Define all locators in the constructor via `page.locator()` and assign them to `this`. Tests and methods reference them as properties — never call a method to obtain a locator.

2. **Prefer `data-test` attributes.** Use `[data-test="..."]` selectors by default. Fall back to CSS or XPath only when no `data-test` attribute exists.

3. **Methods express user intent, not mechanics.** Name methods after what the user is doing (`login()`, `addItemToCart()`, `submitOrder()`), not the underlying interaction (`clickLoginButton()`). A single method may encompass multiple clicks or fills internally.

4. **Navigation methods return the next page object.** Any method that causes a page transition should instantiate and return the appropriate page object, so tests can chain naturally without constructing the next page object themselves.

5. **No assertions in page objects.** `expect(...)` calls belong only in test files. Page objects interact with the page; test files verify outcomes.

## JavaScript-Specific Rules

**CommonJS only.** Use `require`/`module.exports` throughout. Do not use ESM `import`/`export`.

**JSDoc annotations are required on all page object constructors and methods.** Without TypeScript, JSDoc is how editors and Claude Code infer correct call signatures. Every constructor must annotate `@param {import('@playwright/test').Page} page`; every navigation method must declare `@returns {Promise<import('./TargetPage').TargetPage>}`.

**Require page objects inside method bodies to avoid circular dependencies.** When a method returns another page object, `require()` that class inside the method body — not at the top of the file. This is the only safe pattern in CommonJS when two page objects reference each other.

**Prefix internal helpers with `_`.** JavaScript has no enforced access control. Name internal-only methods `_methodName` and do not call them from test files.

## Patterns to Avoid

- **Never use `page.waitForTimeout()`.** Rely on Playwright's built-in auto-waiting. Explicit timeouts hide flakiness and slow down the suite.
- **Never share state between tests.** Every test must be independently runnable. No module-level variables mutated across tests.

## Fixture Reference

| Fixture | User | Starting state |
|---|---|---|
| `inventoryPage` | `standard_user` | Logged in, on `/inventory.html` |
| `problemInventoryPage` | `problem_user` | Logged in, on `/inventory.html` |
| `glitchInventoryPage` | `performance_glitch_user` | Logged in, on `/inventory.html` (15s login timeout) |
| `errorInventoryPage` | `error_user` | Logged in, on `/inventory.html` |
| `visualInventoryPage` | `visual_user` | Logged in, on `/inventory.html` |

### Adding items to cart

`InventoryPage.addToCart(slug)` accepts a product slug directly (e.g. `'sauce-labs-backpack'`). Always pass `product.slug` from `PRODUCTS` — do not pass display names or apply any transformation, as some slugs contain dots and parentheses that a regex transform would corrupt (e.g. `test.allthethings()-t-shirt-(red)`).
