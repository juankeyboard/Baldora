## 2024-05-19 - Avoid Chained Array Methods and Spread Syntax on Large Arrays
**Learning:** Using chained array methods like `.filter().map().reduce()` and the spread operator (`...`) with `Math.max()` or `Math.min()` on large data arrays (e.g., >100,000 items in `history` or `sessionData`) can cause performance issues and `RangeError: Maximum call stack size exceeded` errors.
**Action:** Use a single-pass `for` loop to find extremes and process data instead of chaining array methods or using spread syntax on large datasets to avoid stack overflows and reduce CPU overhead.
