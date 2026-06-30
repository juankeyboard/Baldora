
## 2024-06-30 - Avoid spread operator with Math.max/Math.min on large arrays
**Learning:** Using `Math.max(...array)` or `Math.min(...array)` causes a "Maximum call stack size exceeded" error when the array is very large (e.g., > 100,000 items) because the Javascript engine places all spread array elements onto the function call stack.
**Action:** Replace `Math.max(...array)` with a simple `for` loop that iterates over the elements and updates a tracking variable for the maximum value in a single pass. This avoids the stack size limitation and is also much faster.
