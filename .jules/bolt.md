## 2025-12-10 - DocumentFragment for Matrix Render
**Learning:** For rendering the 15x15 matrix (which requires creating up to 256 elements including headers), sequentially appending each element directly to the container causes a high number of layout reflows and repaints in the browser.
**Action:** Always batch these structural DOM insertions by appending elements to a `DocumentFragment` first, and then append the fragment to the DOM in one single operation.
