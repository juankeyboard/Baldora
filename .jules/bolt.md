# Bolt's Performance Journal

## 2026-06-10 - O(1) binning and single pass loops in JS
**Learning:** In vanilla JS architecture dealing with large data arrays (like DataManager handling 100,000+ attempts), chaining `.filter().map().reduce()` causes extreme CPU overhead due to intermediate array allocations. Furthermore, `Math.max(...array)` crashes with "Maximum call stack size exceeded" on arrays larger than ~100k items. Using object properties to bin distributions inside a loop is also slower than using an integer-indexed array.
**Action:** Replace array method chains with single-pass `for` loops for large datasets. Use `for` loops to manually find max/min values instead of spread operators. Use integer-indexed pre-allocated arrays (e.g. `new Array(numBins).fill(0)`) for bucketing data, and map array indexes to string labels *after* the loop is complete.
