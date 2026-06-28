## 2024-05-15 - Array Rest Spread Maximum Call Stack in `Math.max`
**Learning:** Using `Math.max(...times)` with the spread operator on a mapped array derived from large datasets (e.g. `this.history.map()`) can hit the maximum call stack size in V8/Node JS environments when the dataset contains > 100,000 items, crashing the application.
**Action:** When finding extremes in potentially large datasets, prefer iterating over the array using a simple loop (e.g., `let max = 0; for (...) if (val > max) max = val;`) rather than relying on spread operators or chained map operations.

## 2024-05-15 - Array Method Chaining vs Single-Pass Loops
**Learning:** Chaining array methods like `filter()`, `map()`, and object property lookups inside loops string interpolations are significant performance bottlenecks when processing large data arrays in this vanilla JS architecture. In `getResponseTimeDistribution`, a single-pass loop implementation was roughly 43x faster (43ms vs 1.9s for 1M iterations) compared to the map-then-spread approach.
**Action:** Avoid chaining array methods (`.filter().map().reduce()`) and use single-pass `for` loops with pre-allocated arrays where appropriate to reduce CPU overhead and avoid intermediate array allocations.
