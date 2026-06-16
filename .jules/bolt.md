
## 2024-06-16 - Avoid spread syntax on large arrays
**Learning:** Using the spread operator (`...`) on large arrays (e.g., >100,000 items in `history` or `sessionData`) with `Math.max` or `Math.min` results in "Maximum call stack size exceeded" errors in vanilla JS environments.
**Action:** Always use a single-pass `for` loop to find extrema in large datasets within `DataManager` to avoid crashing the app and bypassing the call stack limits.
