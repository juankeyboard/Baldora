## 2025-12-09 - Use DocumentFragment to batch DOM insertions
**Learning:** For vanilla JS DOM manipulation in the app, individually appending cells to the container using `appendChild` causes a large number of performance-heavy DOM reflows when generating the matrix grid (up to 225 cells).
**Action:** Use `DocumentFragment` to batch insertions. Append all newly created elements to the fragment first, and then append the complete fragment to the container in a single operation to minimize layout recalculations.
