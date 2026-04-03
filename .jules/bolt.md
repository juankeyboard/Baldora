
## 2025-12-09 - Caching DOM Canvas Contexts
**Learning:** In a single-page application architecture like Baldora where the UI structure (like the dashboard) is static but its contents update frequently based on game data, repeated calls to `document.getElementById` and `.getContext('2d')` during frequent render functions cause unnecessary DOM lookups and overhead. Chart.js requires the context, but obtaining it repeatedly inside `render*` functions is inefficient.
**Action:** Always implement a caching mechanism (e.g., a simple `contexts` object and a `_getContext()` helper) in the Chart Manager to store and reuse Canvas API contexts once fetched. This avoids repeated DOM traversal on every UI refresh.
