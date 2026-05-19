## 2024-06-25 - Avoid array spread with Math.max
**Learning:** Using `Math.max(...times)` on large arrays (like `history` in `DataManager`) causes "Maximum call stack size exceeded" errors when the array has ~100k+ elements. String-based dictionary lookups inside iteration loops for bucketing also add major overhead.
**Action:** Use a single-pass `for` loop to find the maximum value, and use integer-indexed arrays for counting bins/buckets before mapping to label strings.
