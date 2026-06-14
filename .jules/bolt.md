## 2025-12-09 - Avoid spreading large arrays in Math.max/min
**Learning:** In vanilla JS arrays (like `history` in `DataManager`), using spread operator `Math.max(...times)` on large arrays (e.g., >100,000 items) throws "Maximum call stack size exceeded".
**Action:** Always use a single-pass loop or `reduce` to find min/max in potentially large datasets to prevent fatal stack overflow errors.

## 2025-12-09 - Array iteration in getSessionStats
**Learning:** `getSessionStats` performs multiple passes over the `sessionData` array (`filter`, `map`, `reduce`), leading to high CPU usage and intermediate array allocations. A single-pass loop is significantly faster.
**Action:** Replace chained array methods with a single `for` loop for computing aggregates on large datasets.
