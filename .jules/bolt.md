## 2024-05-15 - [Batch DOM insertions in grid render]
**Learning:** For a 15x15 grid, appending individual cells directly to the DOM causes 256 reflows per render. In an app where grid configuration changes might occur frequently, this is a significant bottleneck.
**Action:** Use `DocumentFragment` to batch DOM insertions when building large UI grids, reducing reflows from O(N*M) to O(1).
