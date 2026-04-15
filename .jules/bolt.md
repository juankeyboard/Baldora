## 2024-05-24 - Data Aggregation Performance
**Learning:** In vanilla JS architectures, chaining array methods like `.filter()`, `.map()`, and `.reduce()` on large data sets (like the `history` array) causes significant CPU overhead and memory allocation due to multiple intermediate arrays being created and iterated over.
**Action:** Replace chained array methods with single-pass `for` loops when calculating aggregate metrics (totals, averages, counts) on large arrays.
