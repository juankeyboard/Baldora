## 2024-03-24 - Optimize array processing in DataManager
**Learning:** When processing large data arrays in this vanilla JS architecture, chaining array methods like `.filter().map().reduce()` adds significant CPU and memory overhead because each chained operation allocates a new intermediate array.
**Action:** Use single-pass `for` loops to combine filtering and metric aggregation, which significantly reduces CPU overhead. Avoid `Math.max(...array)` on potentially large arrays as it can throw stack overflow errors.
