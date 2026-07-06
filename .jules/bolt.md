## 2024-07-06 - Replacing Math.max with explicit loops for large arrays
**Learning:** In `js/data.js`, `Math.max(...array)` was used on `this.history`. For large arrays (e.g. >100k items), the spread operator causes a `Maximum call stack size exceeded` error. Additionally, using a loop with string-keyed objects for dynamic bucketing inside the loop adds significant CPU overhead.
**Action:** Use a single-pass integer-indexed array (`Int32Array`) to tally buckets efficiently and avoid using spread operations on large datasets. String generation (labels) should happen outside of the hot loop.
