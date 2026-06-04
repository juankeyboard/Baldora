
## 2024-05-24 - DataManager histogram optimization
**Learning:** Using `Math.max(...array)` on large datasets (100k+ entries) throws 'Maximum call stack size exceeded'. Also, binning into an object with string keys via string interpolation inside a hot loop is very slow.
**Action:** Use a single-pass loop to find the max value. For bucketing large datasets, use an integer-indexed array (`new Array(numBins).fill(0)`) and only map the integer indices to string labels after the loop has completed.
