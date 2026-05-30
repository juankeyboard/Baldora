
## 2024-05-18 - Math.max() and Call Stack Limits
**Learning:** Using the spread operator with `Math.max(...array)` or `Math.min(...array)` causes a "Maximum call stack size exceeded" crash in JavaScript when evaluating very large arrays (e.g., `DataManager.history` or `sessionData` arrays with >100,000 objects in Baldora). Attempting to do this on the `response_time` values caused a hard crash when loading large CSV files.
**Action:** Always use a single-pass `for` loop to manually track the maximum or minimum value when dealing with potentially unbounded arrays instead of spread operators. This avoids crashes and also improves performance by removing intermediate array allocations (like `array.map()`).
