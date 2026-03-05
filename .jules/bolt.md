## 2026-03-05 - Batching Firebase RTDB Updates
**Learning:** In the CloudSync module, performing 5 sequential `await this.db.ref(...).set(...)` operations results in 5 separate network roundtrips, degrading frontend performance after a game.
**Action:** Always batch related Firebase RTDB updates across multiple paths into a single `this.db.ref().update(updates)` call to guarantee atomic execution and reduce latency.
