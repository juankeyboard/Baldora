## 2025-12-09 - [Data Processing CPU Overhead]
**Learning:** When processing large data arrays in this vanilla JS architecture, using chained array methods like `.filter().map().reduce()` causes significant overhead due to intermediate array allocations. Further, using `Math.max(...array)` on large datasets can result in Maximum call stack size exceeded errors.
**Action:** Use single-pass `for` loops to combine filtering, mapping, and metric aggregation. Instead of spreading large arrays into `Math.max`, calculate the max value inside the loop.
