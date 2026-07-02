## 2024-05-18 - Avoid spread operator with Math.max on large arrays
**Learning:** Using `Math.max(...array)` on large arrays (e.g. 100k+ elements) causes a 'Maximum call stack size exceeded' error. Also, replacing chained array methods like `.filter().map().reduce()` with single-pass `for` loops avoids unnecessary array allocations and is significantly faster.
**Action:** When finding extremes or processing large vanilla JS data structures (like `DataManager.history`), write single-pass loops instead of using spread operators or chained array methods.
