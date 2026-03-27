# Bolt Journal
## 2025-03-27 - Batching Vanilla JS DOM manipulations
**Learning:** For vanilla JS DOM manipulation in the app (like bulk-updating or building the 15x15 matrix grid), using `container.appendChild` in a loop causes severe layout thrashing and reflows.
**Action:** Always use a `DocumentFragment` to batch insertions into a single reflow, appending all elements to the fragment first, and then appending the fragment to the container.
