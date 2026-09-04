# i18n-sentinel 🛡️🎮

*Brought to you by **Supernova GX***

A lightning-fast, zero-dependency CLI linter designed for game studios and software teams to validate localization assets (`.json`, `.csv`) in CI/CD pipelines. 

## Why Teams Use It
Translators frequently break game builds by accidentally deleting or modifying dynamic layout tags like `{0}`, `%s`, or `{player_name}`. `i18n-sentinel` catches these errors and missing keys instantly before code reaches production QA.

​Installation
npm install -g i18n-sentinel

Usage
​Run it directly in your terminal:
i18n-sentinel locales/en.json locales/ja.json

Options
​--quiet: Suppresses success logs so it only outputs errors (ideal for clean pipeline logs).
​CI/CD Integration (GitHub Actions Example)

name: Validate Localization
on: [push]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npx i18n-sentinel assets/en.json assets/es.json

Exit Codes
​0: All files match perfectly.
​1: Missing keys or mismatched variable tags detected (fails builds safely).
​License
​MIT

