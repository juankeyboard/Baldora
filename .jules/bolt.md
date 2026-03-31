## 2025-01-20 - Batching DOM Insertions in 15x15 Matrix
**Learning:** Iterative DOM insertions when building the 15x15 matrix grid in Baldora caused significant performance overhead due to up to 256 individual reflows/repaints.
**Action:** Always use a `DocumentFragment` to batch DOM insertions when performing large-scale DOM manipulation (like building grids). This reduces the reflow count from `O(N)` to exactly `O(1)`.
