## 2025-12-09 - Avoid Map/Spread on Big Arrays
**Learning:** `Math.max(...history.map(a => a.time))` can exceed the max call stack limit and uses extensive CPU/Memory for allocations on >100K item datasets. Object interpolation `bins[label]` inside the loop makes it even slower.
**Action:** Use single-pass `for` loops, keep bins tracked via `new Array(numBins).fill(0)`, and map integer bin indices, generating string labels only in a final step.
