## 2025-12-09 - [DOM Batching]
**Learning:** Initializing the game board grid by directly inserting cell elements into the active DOM triggered significant and unneeded reflows. By refactoring `js/grid.js` to batch changes via a `DocumentFragment`, performance scales seamlessly regardless of matrix size up to the 15x15 maximum.
**Action:** When dynamically generating large structures within the DOM (especially matrices), use `DocumentFragment` to batch DOM updates prior to insertion.
