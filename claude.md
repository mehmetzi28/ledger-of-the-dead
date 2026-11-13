Ledger of the Dead: single-file HTML/CSS/JS necromancer RPG.
- Game logic is above the `//==UI==` marker; UI and icons below it.
- Saves use localStorage key `ledger-of-the-dead-v1`. Keep loadGame backward compatible: every load goes through normalizeSave (repairs/migrates) and applyLoaded.
- Browsers block localStorage on data: pages, so test saves with `node tools/serve.js` (http://localhost:5173, launch config "game").
- Difficulty is tuned with the DIFF block (gates) and the TW constants (Hell Tower). Balance was tested with bots only. The bot lives in tests/balance-test.js: paste it into the browser console with the game open, or load it from the local server (see the top of the file), then run LOTD_BALANCE.run({modes:['market']}).
- Tests: `node tests/run-tests.js` runs tests/game-tests.js (170 tests, one group per system, plus a 30-day bot playthrough) against index.html in Node with a fake browser; add `market` etc. to run one group. Run it after every change. The same file runs in the browser console via LOTD_TESTS.run().
- Dark palette. Blue and purple are only for the Rare and Epic item tiers.
- No external libraries except Google Fonts.