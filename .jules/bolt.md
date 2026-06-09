
## 2024-05-18 - Math.max Stack Overflow and Integer-Indexed Array Bucketing Optimization
**Learning:** Using `Math.max(...array)` on large datasets (e.g. `history` arrays over ~100k items) throws a "Maximum call stack size exceeded" error. Additionally, building histograms by iteratively assigning counts to string-based object properties inside a loop is extremely slow.
**Action:** Replace `Math.max(...array)` with a single-pass `for` loop to track extreme values. For bucketing/binning logic, always pre-allocate an integer-indexed array (`new Array(numBins).fill(0)`) to store counts in the hot loop, and only generate string labels in a second pass over the bins at the end.
