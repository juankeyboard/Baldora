## 2024-05-24 - Maximum call stack size exceeded in Math.max()
**Learning:** Using the spread operator (`...`) with functions like `Math.max` or `Math.min` on large arrays (e.g., >100,000 items) throws a 'Maximum call stack size exceeded' error.
**Action:** Avoid spread operator for min/max on large arrays; use a `for` loop to find the minimum/maximum.
## 2024-05-24 - Avoiding Array Methods on Large Datasets
**Learning:** Using chained array methods like `.filter().map().reduce()` on large datasets in vanilla JS creates significant CPU overhead due to multiple array traversals and allocations.
**Action:** Use a single-pass `for` loop to combine filtering and mapping/reducing operations.
