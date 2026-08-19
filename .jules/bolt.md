## 2024-05-23 - [Grid Rendering Optimization using DocumentFragment]
**Learning:** In highly dynamic web apps manipulating the DOM manually (like Baldora's grid system rendering matrices up to 15x15), appending children directly to the container in a loop forces N+1 reflows/paints.
**Action:** Use a `DocumentFragment` to batch append operations into memory first, and then append the complete fragment to the DOM container. This reduces reflows to just 1 operation and improves the loop execution speed measurably.
