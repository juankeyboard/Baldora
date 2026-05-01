## 2024-05-01 - Avoid Chaining Array Methods for Performance
**Learning:** Chaining array methods like `.filter().map().reduce()` creates intermediate arrays, causing significant performance degradation and memory overhead on large datasets like `DataManager.history`. Also, using `Math.max(...times)` with the spread operator on large arrays causes "Maximum call stack size exceeded" errors.
**Action:** Replace chained array operations and spread operator function calls with single-pass `for` loops to drastically improve performance and avoid call stack limits on large datasets.
