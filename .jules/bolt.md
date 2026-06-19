
## 2024-06-19 - Max Call Stack & String Object Bucketing on Large Arrays
**Learning:** In the Baldora app context (where arrays like `DataManager.history` can reach 100k+ items), using `Math.max(...array)` crashes the JavaScript engine with a "Maximum call stack size exceeded" error. Additionally, building dynamic bins using string keys and interpolation inside a loop is extremely slow and memory inefficient compared to using a pre-allocated, zero-filled integer-indexed array.
**Action:** When bucketing large data arrays or finding max/min values, avoid the spread operator. Use single-pass `for` loops for finding extremes and pre-allocate integer-indexed arrays (like `new Array(size).fill(0)`) for counting, generating string labels only *after* the loop is finished.
