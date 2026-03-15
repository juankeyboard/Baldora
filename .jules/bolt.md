## 2026-03-15 - DocumentFragment for Bulk DOM Operations
**Learning:** When building large UI grids dynamically (like the 15x15 matrix which creates ~256 elements), appending individual nodes directly to the live DOM in nested loops causes severe layout thrashing (O(N*M) reflows).
**Action:** Always batch DOM insertions by appending elements to a `DocumentFragment` in memory first, then appending the fragment to the live DOM once (O(1) reflow) to prevent rendering bottlenecks.
