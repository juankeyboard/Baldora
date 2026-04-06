## 2025-01-13 - [DocumentFragment for grid rendering optimization]
**Learning:** Rendering a large grid (15x15) dynamically in DOM elements can cause repetitive and expensive DOM reflows when appended cell by cell sequentially directly to the parent container.
**Action:** Use `DocumentFragment` to build and batch insertions of DOM nodes, minimizing heavy DOM reflows by pushing to the DOM once. This pattern must be followed whenever doing batch DOM manipulation in vanilla JavaScript, particularly when building large UI grids or matrices in this codebase.
