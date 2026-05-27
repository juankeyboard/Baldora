
## 2024-05-18 - Math.max Stack Overflow & Array Bucketing Optimization
**Learning:** Using `Math.max(...array)` on very large datasets (>100k items) in `js/data.js` causes a "Maximum call stack size exceeded" error. Additionally, building histogram bins using string-keyed objects inside a loop is slow due to memory allocation and string interpolation overhead.
**Action:** Always use a single-pass `for` loop to find max/min values in large arrays instead of spread operators. For bucketing/histograms, calculate the number of bins upfront, allocate an integer-indexed array (`new Array(numBins).fill(0)`), and delay creating string labels until after the counting is complete.
