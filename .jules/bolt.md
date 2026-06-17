## 2024-05-19 - Single-Pass Loops over Chained Array Methods in Vanilla JS
**Learning:** In vanilla JS architectures like Baldora processing large arrays (100,000+ items), chaining methods like `.filter().map().reduce()` causes significant memory overhead and CPU time due to intermediate array allocations. `Math.max(...times)` can also exceed the call stack limit on large datasets.
**Action:** Always replace chained array methods with single-pass `for` loops in performance-critical data processing paths (like in `DataManager`). Avoid spread operator on large arrays to find extremes.
