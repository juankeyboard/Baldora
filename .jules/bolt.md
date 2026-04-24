## 2024-05-24 - Maximum call stack size exceeded with Math.max on large arrays
**Learning:** Using `Math.max(...array)` on large arrays (e.g. >100,000 items) throws a "Maximum call stack size exceeded" error because the spread operator expands the array into individual arguments for the function call, which hits JavaScript engine limits.
**Action:** When finding the maximum value in large datasets (like `history` arrays), always iterate using a `for` loop and keep track of the maximum value manually.
