## 2025-12-09 - [DOM Batching] DocumentFragment for large grid generation
**Learning:** Directly appending hundreds of elements to the live DOM container during the initialization of the 15x15 matrix grid in `js/grid.js` causes severe layout thrashing and performance degradation, especially evident on slower devices.
**Action:** Use `DocumentFragment` to build the entire matrix offline and perform a single `appendChild` to the live container, drastically reducing reflows and repaints.
