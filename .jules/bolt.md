
## 2024-05-30 - Maximum call stack size exceeded in Array mapping
**Learning:** Using `Math.max(...array)` on large datasets (e.g., history over 100k items) causes a "Maximum call stack size exceeded" error. Similarly, doing array operations like `.map()` prior to iterations incurs memory overhead.
**Action:** When finding extremes or processing large vanilla JS arrays, use single-pass `for` loops rather than the spread operator or chaining `map()` and `reduce()`. Furthermore, integer-indexed bucketing logic avoids performance bottlenecks related to dynamic string generation within large iteration cycles.
