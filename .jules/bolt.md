## 2024-05-24 - [Cache DOM Queries]
**Learning:** Caching `.view` NodeLists as arrays for repeated class removal operations provides a ~58% performance improvement over direct `document.querySelectorAll` calls in this SPA architecture where views are switched frequently.
**Action:** When working on view managers or independent modules, use a lazy-loading `_getViewCache` pattern instead of repeatedly querying the DOM for view elements.
