## 2025-02-09 - DocumentFragment for Bulk DOM Render Optimization
**Learning:** For vanilla JS DOM manipulations, directly appending individual elements to the DOM in a loop causes significant performance drops due to excessive reflows, particularly for grids like the 15x15 matrix layout (potentially 256 items).
**Action:** Always batch element insertions using `DocumentFragment` before appending the fragment directly into the DOM container in one single operation.
