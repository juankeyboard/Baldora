## 2024-04-10 - Chained Array Methods Bottleneck
**Learning:** In this vanilla JS architecture, chaining array methods like `.filter().map().reduce()` on large data arrays (such as the `history` array in `DataManager`) causes significant CPU overhead due to multiple passes over the array and intermediate array allocations.
**Action:** Replace chained array methods with single-pass `for` loops to combine filtering and metric aggregation, significantly reducing CPU overhead and memory allocations.
