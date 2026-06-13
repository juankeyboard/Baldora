
## 2024-05-15 - [DataManager single-pass iterations and large array limits]
**Learning:** Chaining array methods like `.filter().map().reduce()` on large datasets (`>100k` elements) in this vanilla JS architecture creates significant overhead via intermediate array allocations. Furthermore, using the spread operator with `Math.max(...array)` on arrays of this size crashes with a "Maximum call stack size exceeded" error.
**Action:** When calculating statistics or bins across datasets like `DataManager.history`, use single-pass `for` loops with primitive counters and integer-indexed arrays. To find maximums in large arrays, iterate and compare instead of using `Math.max` with the spread operator.
