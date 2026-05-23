## 2024-05-23 - DataManager array operations limit call stack
**Learning:** `Math.max(...array)` throws "Maximum call stack size exceeded" for large datasets (>100,000 items) like `DataManager.history`. Also, chained array methods (`.filter().map().reduce()`) allocate significant memory and are ~10x slower on 100k items than a single-pass `for` loop.
**Action:** Always use single-pass `for` loops (instead of chaining) and avoid spread operators inside `Math.min/max` when iterating over large collections (e.g. `history` arrays) in this application.
