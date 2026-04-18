## 2024-05-24 - [Avoid chained array methods on large datasets]
**Learning:** Chaining array methods like `.filter().map().reduce()` on large data arrays (like `DataManager.history`) causes significant CPU overhead and memory allocation due to the creation of intermediate arrays.
**Action:** Use single-pass `for` loops to combine filtering and metric aggregation in vanilla JS architectures when processing large arrays.
