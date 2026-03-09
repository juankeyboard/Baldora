# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Baldora** is a 15Ã—15 multiplication practice game (educational web app). Players practice multiplication tables through three game modes, with real-time feedback, analytics, cloud persistence, and Gemini AI coaching.

## Running the Project

No build step â€” pure vanilla JS with CDN dependencies.

```bash
# Local development
python -m http.server 8000
# or
npx http-server

# Deploy to Firebase
firebase deploy
```

## Architecture

### Single Page Application
Three-state machine: `CONFIG â†’ PLAYING â†’ DASHBOARD`

- **CONFIG**: Player selects game mode, nickname, and multiplication tables
- **PLAYING**: Random multiplication problems, real-time feedback (green=correct, yellow=wrong)
- **DASHBOARD**: Analytics charts, CSV export, optional Gemini AI analysis

### Game Modes
- `TIMER` â€” Fixed time limit
- `FREE` â€” No time limit
- `ADAPTIVE` â€” Diagnosis phase â†’ targeted training on weak tables

### Module Structure (js/)
All modules follow a namespaced object pattern:

| Module | Responsibility |
|--------|---------------|
| `app.js` | Core game loop and state machine |
| `grid.js` | 15Ã—15 matrix rendering and cell state |
| `data.js` | CSV parsing (PapaParse), session recording |
| `auth.js` | Firebase Google Sign-In/Out |
| `cloudSync.js` | Firebase Realtime Database sync, leaderboards |
| `charts.js` | Chart.js analytics visualization |
| `audio.js` | AudioManager â€” BGM/SFX, mute, localStorage persistence |
| `exportManager.js` | CSV/PDF export (jsPDF, html2pdf) |
| `gemini-service.js` | Firebase AI Logic â†’ Gemini 2.5 Flash Lite analysis |
| `userProfile.js` | User dashboard, profile modal, historical analytics |
| `share-instagram.js` | Social sharing, canvas image generation |
| `onboarding.js` | Driver.js first-time user tour |
| `visitor-counter.js` | Visitor analytics |

### Backend Services (Firebase)
- **Auth**: Google OAuth via Firebase Authentication (`authDomain: "baldora.org"`)
- **Database**: Firebase Realtime Database â€” game sessions, stats, leaderboards
- **AI**: Firebase AI Logic with Gemini 2.5 Flash Lite â€” performance analysis
- **App Check**: reCAPTCHA v3 for security
- **Hosting**: `baldora-89866.firebasestorage.app`, custom domain `baldora.org`

### Session Data (CSV schema)
```
timestamp, nickname, game_mode, factor_a, factor_b, user_input, correct_result, is_correct, response_time
```

## Key Implementation Rules

**All new code must be strictly additive and modular.** Never alter, replace, or interfere with existing functions, design, flows, or behaviors. This is the primary rule for this project (from the docs).

### Firebase OAuth Notes
- `Cross-Origin-Opener-Policy: same-origin-allow-popups` header is set in `firebase.json` â€” required for Google Sign-In popup flow
- Auth domain is `baldora.org`, not the default Firebase domain â€” OAuth redirect URIs must be registered there

### Audio
- AudioManager in `audio.js` handles BGM and SFX preloading
- Mute state persists via `localStorage`

### Adaptive Mode
- Diagnosis phase identifies weak multiplication pairs
- Training phase targets those specific pairs with spaced repetition logic

## Documentation

14 feature-specific docs in `/docs/` (in Spanish):
- `f2_adaptativo.md` â€” Adaptive training system details
- `f8_AI.md` â€” Gemini AI integration specs
- `f14_UserSystem.md` â€” User auth and persistence (actively being iterated)

## Deployment

Firebase project ID: `baldora-89866`

```bash
firebase deploy          # Deploy everything
firebase deploy --only hosting   # Hosting only
```

