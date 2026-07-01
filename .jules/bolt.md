## 2024-05-24 - Math.max Spread Operator Call Stack Size
**Learning:** Using `Math.max(...array)` crashes with "Maximum call stack size exceeded" when processing large histories loaded from CSV (> 120,000 elements).
**Action:** Replace `...` spread operator with a single-pass loop for finding extremes in large datasets.

## 2024-05-24 - Array vs Object Dictionary for Histograms
**Learning:** String interpolation and property accesses in tight loops (`bins[\`${binIndex / 1000}s\`]++`) creates huge overhead and garbage collection pauses when processing large histories.
**Action:** Use integer-indexed arrays (`counts[binIndex]++`) for histogram buckets, and map integer indices to string labels only once after the loop finishes.
