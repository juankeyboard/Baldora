
## 2024-05-17 - Avoid Math.max/min with spread operator on large arrays
**Learning:** Using `Math.max(...array)` or `Math.min(...array)` on large datasets (e.g., >100,000 items in `DataManager.history`) will cause a `Maximum call stack size exceeded` error because JavaScript engines limit the number of arguments a function can take. Additionally, building object-based dictionaries with string interpolation inside hot loops is slow.
**Action:** Always use a single-pass `for` loop to find min/max values manually in large arrays. For binning or frequency maps with numerical bounds, allocate a fixed-size integer-indexed array (`new Array(n).fill(0)`) to tally counts, and generate the corresponding string labels in a separate, smaller loop afterward to avoid string interpolation overhead.
