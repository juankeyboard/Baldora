## 2024-05-18 - [Optimizing DOM Layout Thrashing in 15x15 Matrix Generation]
**Learning:** For vanilla JS DOM manipulation in this app, directly using `appendChild` over 256 times in loops (to generate the 15x15 matrix grid layout with its headers) forces significant reflows, contributing to main thread blocking.
**Action:** Always batch element insertions using `DocumentFragment` before appending to the live DOM when generating large, dynamic grids or lists.
