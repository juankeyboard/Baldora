## 2025-12-09 - Use DocumentFragment for grid rendering
**Learning:** The Baldora 15x15 matrix grid dynamically generates and appends up to 256 individual `div` elements to the DOM in a single render pass.
**Action:** When building large UI grids or batching vanilla JS DOM manipulations in this app, always use `document.createDocumentFragment()` to batch DOM insertions to minimize performance-heavy DOM layout thrashing and repaints.
