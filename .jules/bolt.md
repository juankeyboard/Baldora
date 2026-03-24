## 2025-12-09 - [Performance] Prevent Maximum call stack size exceeded in array spread
**Learning:** Using `Math.max(...array)` or `Math.min(...array)` with large arrays (> 100,000 items) throws `RangeError: Maximum call stack size exceeded` because the spread operator expands the array into individual arguments.
**Action:** Replace `Math.max(...array)` with a simple `for` loop or `reduce` function when dealing with potentially large arrays to avoid stack overflow errors and improve performance.
