## 2024-05-19 - Maximum call stack size exceeded in DataManager.getResponseTimeDistribution()
**Learning:** Using `Math.max(...times)` with the spread operator on large data arrays (like `DataManager.history` with 100,000+ items) causes a "Maximum call stack size exceeded" error, breaking the application's reporting entirely for heavy users.
**Action:** Never use the spread operator with `Math.max()` or `Math.min()` on unbounded data arrays. Always use a single-pass loop or `reduce` to find extremes in arrays that scale with user activity.

## 2024-05-19 - Inefficient Array manipulations in DataManager
**Learning:** Chained array methods like `.filter().map().reduce()` and allocating large intermediary objects with string-based keys in `DataManager` methods (`getSessionStats`, `getAccuracyDistribution`) are extremely slow for large datasets compared to single-pass `for` loops, showing a ~10-15x performance degradation for 150k items (e.g. 55ms down to 4ms).
**Action:** When writing or optimizing data aggregation methods in this Vanilla JS architecture for arrays that can grow indefinitely (like `history` or `sessionData`), prefer single-pass `for` loops and integer-indexed arrays over chained functional array methods or string-based object property lookups inside the loop.
