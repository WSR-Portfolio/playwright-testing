# Playwright Testing Portfolio

End-to-end test suite for [SauceDemo](https://www.saucedemo.com), a purpose-built 
web app used for practicing test automation. Built with Playwright and JavaScript 
using the Page Object Model pattern.

This project is part of my QA portfolio, demonstrating test design, architecture 
decisions, and AI-assisted development workflow using Claude Code.

## What's Here

- 6 spec files, 60 tests covering login, inventory, cart, and checkout flows
- Page Object Model with a shared `BasePage` and consistent locator conventions
- Custom fixtures for authenticated test setup across multiple user types
- Centralized test data (users, products) kept separate from test logic

## What's Not Here
- Since SauceDemo has no payment gateway, no charges occur and payment edge cases (eg: declined cards, CVV validation) are meaningless
- All state is client-side. There is no backend to probe for SQL injection, XSS, rate limiting, or API fuzzing so server-side API behavior / security injection tests have no surface area
- Credentials are hardcoded on the login page so no registration or recovery flows exist
- SauceDemo is a training target. Deep browser matrix testing is outside its purpose
- Except for the scripted performance_glitch_user delay, there is no server to overload. Latency tests are not meaningful

## Tech Stack

- [Playwright](https://playwright.dev/) — test framework and browser automation
- JavaScript (CommonJS)
- Node.js

## Setup
```bash
npm install
npx playwright install
```

## Running Tests
```bash
# Run all tests
npx playwright test

# Run a single spec file
npx playwright test tests/login.spec.js

# Run with UI mode
npx playwright test --ui

# View HTML report after a run
npx playwright show-report
```

## A Note on AI-Assisted Development

This project was built using Claude Code as a development partner. Prompting 
an AI effectively — knowing what to ask for, how to verify the output, and when 
to push back — is a skill in itself, and one I've deliberately built into my 
workflow. The test strategy, architecture decisions, and quality bar are mine; 
Claude helped implement them.
