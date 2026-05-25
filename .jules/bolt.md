## 2024-05-14 - Maximum call stack size exceeded with Math.max(...array)
**Learning:** Using the spread operator (`...`) with `Math.max` or `Math.min` on large arrays (like `history` or `sessionData` with 100,000+ items) causes a 'Maximum call stack size exceeded' error in JavaScript. This breaks functionality when users have large datasets.
**Action:** Always use a single-pass `for` loop to find extreme values (min/max) when processing potentially large data arrays. This not only prevents call stack errors but is also faster and avoids creating intermediate array copies via `.map()`.
