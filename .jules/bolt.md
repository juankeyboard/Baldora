
## 2024-06-03 - DataManager Array Processing and Stack Limits
**Learning:** Using `Math.max(...array)` on large arrays (like `history.map(a => a.response_time)` with >100k items) causes a "Maximum call stack size exceeded" error in V8, crashing the application entirely when generating the dashboard charts. Additionally, chaining array methods (`.filter().map().reduce()`) on these large arrays is a significant performance bottleneck due to intermediate array allocations and multiple iterations.
**Action:** Always use single-pass `for` loops for finding extremums or aggregating data in vanilla JS when the array size can grow unbounded over a session. Replace string-based object keys with integer-indexed arrays (pre-allocated) for bucketing/histogram algorithms for an extra speed boost.
