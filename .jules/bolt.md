
## 2024-05-24 - Array Iteration and Spread Operator Limitations
**Learning:** Using chained array iteration methods (`.filter().map().reduce()`) introduces huge hidden O(N) array allocation overheads for massive datasets (>100k items) common in analytics engines. Furthermore, utilizing the spread operator (`...`) inside `Math.max()` directly on these large data sets will quickly throw a "Maximum call stack size exceeded" V8 engine error.
**Action:** When operating on very large dataset arrays in vanilla Javascript for analytics calculations (like histograms, averages, tops), always rewrite logic to utilize a single-pass `for` loop to avoid intermediate allocations and manually track extremum (e.g. `max`) to avoid spreading massive arrays into function arguments.
