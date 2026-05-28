# Test Suite Review

**Project:** playwright-testing (SauceDemo)
**Date:** 2026-05-28
**Reviewer:** Claude Code

---

## Overall Assessment

The suite is well-structured, has good coverage of both happy paths and defect documentation, and uses Playwright's fixture system correctly. All actionable findings below have been resolved.

---

## Findings

### 1. Backwards assertion — `inventory.spec.js:152` ✅ Fixed — commit `bc6b84f`

The test was named "add to cart button labels **have anomalies**" but the assertion `toBe(0)` meant the test passed only when there were no anomalies. Running the test confirmed no anomalies exist for visual_user. The test name and annotation type were updated to reflect reality:

- **Before:** `test('add to cart button labels have anomalies', ...)` / `type: 'bug'`
- **After:** `test('add to cart button labels are correct', ...)` / `type: 'info'`

---

### 2. Misleading test name — `login.spec.js:66` ✅ Fixed — commit `0dded08`

"standard user can log out and **session is cleared**" implied localStorage/cart clearing, which the test never checks. Renamed to accurately describe what it verifies: redirect to login page and back-navigation is blocked.

- **Before:** `'standard user can log out and session is cleared'`
- **After:** `'standard user can log out and back button cannot re-enter the app'`

---

### 3. Time-based assertion fires before functional checks — `inventory.spec.js:61` ✅ Fixed — commit `185cc5d`

`expect(elapsed).toBeGreaterThan(3000)` ran before URL, title, and product count assertions. A timing failure gave no signal about whether login actually succeeded. Moved the assertion to after the functional checks so failures are meaningful.

---

### 4. Redundant `waitForURL` after `login()` — `inventory.spec.js:55` ⚠️ Retracted

On closer inspection, `LoginPage.login()` only clicks the button and returns immediately with no navigation await. The `waitForURL` is required to know when to stop the timer. Nothing to fix.

---

### 5. Duplicate price-parsing pattern — `checkout.spec.js:131–133` and `207–209` ✅ Fixed — commit `bcafb25`

`parseFloat(text.replace(/[^0-9.]/g, ''))` appeared identically in two separate tests. Extracted to a top-of-file helper:

```js
const parseDollars = text => parseFloat(text.replace(/[^0-9.]/g, ''));
```

---

### 6. Live external URL dependency — `navigation.spec.js:24` ℹ️ No fix needed

The "About" test navigates to `saucelabs.com`. The existing 10 second `waitForURL` timeout is reasonable. CI has `retries: 2` as a safety net. Awareness item only — worth knowing if the test starts flaking in local runs.

---

### 7. Visual user image test name doesn't match its assertions — `inventory.spec.js:113` ✅ Fixed — commit `51121bd`

The test name claimed "images are mismatched" but the assertion only confirms all 6 image sources are unique — it cannot detect incorrect image/product pairings. Renamed to match what the assertions actually verify.

- **Before:** `'product names match catalog but images are mismatched'`
- **After:** `'product names match catalog and all product images are distinct'`

---

## What's Working Well

- Defect-documentation pattern (`test.info().annotations`) is used consistently and correctly throughout.
- Page Object structure is clean and the fixture hierarchy (`auth.js` extending base test) is exactly right.
- The cart state persistence defect test (`login.spec.js:44`) is a textbook example of how to write a test that documents a known bug — it asserts the buggy behavior and will fail when the bug is fixed, acting as a trip-wire.
- `EXPECTED_ITEM_TOTAL` being computed from `PRODUCTS` rather than hardcoded is a good call.
- The `for...of` loop in the problem user "add to cart" test (`inventory.spec.js:171`) is more appropriate than `forEach` because it uses `await` inside the loop body.

---

## Final State

**60/60 tests passing** after all fixes applied.
