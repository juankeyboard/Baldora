## 2024-05-24 - Avoiding Array Methods on Large Datasets
**Learning:** In vanilla JS architectures handling large unbounded arrays (like a `history` of gameplay stats), chained array methods (`.filter().map().reduce()`) and the spread operator (`Math.max(...array)`) introduce significant CPU overhead and can cause "Maximum call stack size exceeded" errors.
**Action:** Use single-pass `for` loops to combine filtering, mapping, and aggregating metrics, and find minimum/maximum values iteratively.
