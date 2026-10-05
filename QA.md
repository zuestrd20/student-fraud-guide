# Verification

## Build architecture
- Static HTML/CSS/JavaScript; no package installation or compilation required.
- Relative asset and JSON URLs; hash routes work under a GitHub Pages repository prefix.
- No analytics, third-party scripts/fonts, login, cookies, localStorage, or personal-data collection.
- Educational examples are fictional. Police cases, recorded victims, and financial loss are separate fields.

## Checks run locally
- `node --check app.js`
- `node tests/check-data.mjs`
- Independent renderer and interaction checks: separate QA report.

## Browser verification limit
Local Chromium could not start because the runtime rejected a browser socket operation. The cloud browser rejected the local preview address with ERR_BLOCKED_BY_CLIENT. These are not browser-test passes. No security restriction was bypassed. `tests/browser.mjs` describes the intended desktop, mobile, enlarged-text, route, quiz, filter, and download checks. Public GitHub Pages must be checked after publication before claiming end-to-end completion.

## Public verification checklist
- Main page and all six navigation views render; assets and JSON load under repository URL.
- Data year/metric reset, official-method filter, missing-year state, and JSON download work.
- Search, empty result, clear, category filter, and details disclosure work.
- All ten questions reveal explanations; previous/back/deep-link/restart flows are safe.
- Keyboard controls, focus visibility, 390px/320px layouts, and 200% text remain usable.
- Check that final published commit matches the frozen artifact.
