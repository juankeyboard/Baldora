
## 2024-05-09 - Avoid Math.max(...times) with Spread Operator & Use Single-Pass Loops
**Learning:** Using the spread operator (`...`) with `Math.max` or `Math.min` on large arrays (e.g. > 100,000 items) results in `RangeError: Maximum call stack size exceeded`. Additionally, chaining array methods like `.filter().map().reduce()` causes huge performance bottlenecks due to intermediate array allocations.
**Action:** Replace `Math.max(...array)` with a single-pass `for` loop to find maximum values. Replace array method chains with single-pass `for` loops to minimize CPU overhead and avoid creating intermediate arrays, reducing execution time significantly (e.g. 200ms -> 10ms for 1,000,000 items).
