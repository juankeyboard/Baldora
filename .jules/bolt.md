## 2024-06-26 - Call Stack Size Limit Exceeded with Array Spread & Optimization

**Learning:** Using the spread operator (`Math.max(...times)`) on large arrays (like `DataManager.history` or `sessionData` > 100,000 items) throws a "Maximum call stack size exceeded" error. Furthermore, when computing histograms/bins over these large arrays, creating objects keyed by string-interpolated labels in a tight loop is very slow compared to tracking bins via simple integer arrays.

**Action:** Replace `Math.max(...arr)` with a manual `for` loop to compute limits for large data arrays. When binning or counting frequencies on large data sets, use pre-allocated integer arrays (or JS arrays behaving as integer arrays) indexed mathematically, and compute formatted string labels via mapping only after the counting loop is complete.
