## 2024-03-26 - [DocumentFragment for Batch DOM Insertion]
**Learning:** For vanilla JS DOM manipulation in the app (like bulk-updating or building the 15x15 matrix grid), doing individual insertions inside loops can cause severe layout thrashing/reflows.
**Action:** Use `DocumentFragment` to batch insertions and append them all to the DOM at once to minimize performance-heavy DOM reflows.