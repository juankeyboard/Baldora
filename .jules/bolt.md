## 2024-05-04 - [Single-pass Array Analytics]
**Learning:** Chaining `.filter().map()` over large vanilla JS data arrays (`history` or `sessionData`) creates too much CPU overhead, and using the spread operator like `Math.max(...times)` crashes with "Maximum call stack size exceeded" around 200,000+ items.
**Action:** When working on data analytics functions on this codebase, prioritize using single-pass `for` loops to directly accumulate values or search for min/max to maintain performance and avoid stack crashes.
