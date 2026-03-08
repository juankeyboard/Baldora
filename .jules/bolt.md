## 2024-03-08 - Firebase Realtime Database Write Batching
**Learning:** In the `CloudSync` module (`js/cloudSync.js`), independent Firebase Realtime Database `.set()` operations on different paths can cause unnecessary network latency and block execution when awaited sequentially.
**Action:** Use multi-path updates via `.update(updates)` to batch independent state changes into a single network roundtrip. For logically independent async operations, use `Promise.all()` to execute them concurrently instead of sequentially awaiting them.
