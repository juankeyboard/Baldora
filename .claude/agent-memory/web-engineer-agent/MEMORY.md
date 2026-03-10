# Baldora - Agent Memory

## Stack
- HTML5 + CSS3 + Vanilla JS, Firebase (Auth, RTDB, Hosting, AI Logic)
- No bundler, CDN dependencies, python http.server or npx serve for local dev
- Firebase project ID: baldora-89866, custom domain: baldora.org

## Architecture
- SPA with state machine: CONFIG -> PLAYING -> DASHBOARD (+ GHOST_SELECTION, BATTLE, etc.)
- Modules: app.js, grid.js, data.js, auth.js, cloudSync.js, battleManager.js, charts.js, audio.js, etc.
- All modules use namespaced object/IIFE pattern
- CLAUDE.md rule: all code must be strictly additive, never alter existing functions

## Firebase RTDB Structure
- `users/{uid}/games/{gameId}` - individual game sessions
- `users/{uid}/stats` - accumulated stats (community_score, community_league, etc.)
- `users/{uid}/best_session_ghost` - ghost data with responses array for battle engine
- `leaderboard/players/{uid}` - **source of truth** for displayName, tier, league, rank, ghost_available
- `leaderboard/ghosts/{uid}` - ghost battle stats (score, avg_time_ms, tier, league)
- `leaderboard/community_benchmarks` - global benchmarks for score calculation

## Key Patterns
- `_recalculateMyTier` in cloudSync.js updates tier/league in: users/{uid}/stats, leaderboard/players, AND leaderboard/ghosts
- Ghost selection reads from leaderboard/players (filtered by ghost_available === true), enriched with leaderboard/ghosts data
- League hierarchy: DIAMANTE > PLATINO > ORO > PLATA > BRONCE > MADERA
- Tier calculation: percentile rank among all players (1=top, 100=bottom)

## User Preferences
- Language: Spanish
- Commit after each change (don't wait to be asked)
- Local server on port 8000 (python -m http.server 8000)
