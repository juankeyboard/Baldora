
## 2026-04-19 - [Avoid Chained Array Methods and Spread Operators on Large Arrays]
**Learning:** In a vanilla JS architecture, using chained array methods like `.filter().map().reduce()` causes significant CPU overhead by allocating intermediate arrays. Furthermore, using the spread operator (`...`) with functions like `Math.max` or `Math.min` on large arrays (e.g., >100,000 items) leads to 'Maximum call stack size exceeded' errors because the JS engine attempts to push every array element onto the call stack as an argument.
**Action:** Replace chained array methods with single-pass `for` loops to combine filtering, mapping, and aggregating into one step. Avoid the spread operator on large arrays entirely; instead, manually iterate using a `for` loop to find min/max values.
