## 2025-03-16 - Prevent layout thrashing on matrix generation
**Learning:** During the 15x15 matrix grid generation, appending up to 256 individual DOM elements directly to `this.container` triggers excessive layout thrashing and reflows, which is an identified codebase-specific anti-pattern for large DOM updates.
**Action:** Always batch mass DOM insertions by building the sub-tree entirely inside a `DocumentFragment` first, then append the `DocumentFragment` to the target container in a single operation.
