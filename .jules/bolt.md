## 2024-05-18 - Math.max() Call Stack Size Limit
**Learning:** Using `Math.max(...array)` on large arrays (e.g., >100,000 items) throws a 'Maximum call stack size exceeded' error because the spread operator passes each element as an individual argument to the function, hitting engine-specific limits on the number of arguments.
**Action:** Always use an iterative loop to find the maximum or minimum value when working with unbounded or potentially large arrays in vanilla JS.

## 2024-05-18 - Chained Array Methods Overhead
**Learning:** Chaining array methods like `.filter().map().reduce()` on large datasets in vanilla JS creates intermediate array allocations and requires multiple full passes over the data, resulting in significant CPU and memory overhead compared to single-pass `for` loops.
**Action:** When calculating aggregated statistics over large data arrays, refactor chained array methods into single-pass `for` loops to combine filtering, mapping, and reduction operations.
