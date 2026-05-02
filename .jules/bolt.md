
## 2026-05-02 - Optimize DataManager analytics arrays
**Learning:** In this vanilla JS architecture with potentially large datasets (e.g., >100,000 items in `history` or `sessionData`), chaining array methods like `.filter().map().reduce()` allocates intermediate arrays and causes CPU overhead. Furthermore, using the spread operator with `Math.max(...times)` on large arrays triggers "Maximum call stack size exceeded" errors.
**Action:** When dealing with potentially large arrays of app data, replace chained array methods and spread operators with single-pass `for` loops. This avoids browser crashes, reduces memory allocations, and dramatically improves execution time (from ~46ms to ~5ms for stats calculation over 200k items).
