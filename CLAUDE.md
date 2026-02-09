# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CardCheckAlgo is an interactive Luhn algorithm demonstration built with Angular. The UI is in Russian. It visualizes step-by-step how the Luhn checksum validates credit card numbers, including a tutorial mode, a step-by-step breakdown table, and a summation section. Deployed to GitHub Pages on push to `main`.

## Commands

- **Dev server:** `npm start` (runs `ng serve`)
- **Build:** `npm run build` (production build to `dist/card-check-algo/`)
- **Tests:** `npm test` (Karma via `ng test`)

## Architecture

This is a single-component standalone Angular app — no routing, no services, no modules.

- `src/main.ts` — bootstraps `AppComponent` with `provideAnimations()`
- `src/app/app.component.ts` — all application logic lives here as Angular signals (`signal`, `computed`, `effect`). Key computed signals:
  - `digits` / `formatted` — parse and format raw input
  - `luhnSteps` — core Luhn algorithm producing `LuhnStep[]` (index, digit, doubled flag, result, position info)
  - `displaySteps` — applies RTL/LTR ordering for the table view
  - `total` / `isValid` / `checkDigit` / `sumRemainder` — validation derived from `luhnSteps`
- `src/app/app.component.html` — template with sections: hero (card preview), input panel, algorithm explanation, tutorial stepper, step-by-step table, summation, and explanatory note
- `src/app/app.component.css` — component styles with light/dark theme support via CSS custom properties
- `src/styles.css` — global styles, CSS variables for both themes (`:root` and `:root.theme-dark`), typography (Space Grotesk + Sora)

## Key Patterns

- **Signals-only state:** no RxJS subscriptions for UI state; everything is `signal()` / `computed()`. Theme persistence uses `localStorage` via an `effect()`.
- **Dark theme:** toggled by adding `theme-dark` class to `document.documentElement`. Both global and component CSS define `:root.theme-dark` overrides.
- **Production base href:** set to `/card-check-algo/` in the production build config (`angular.json`).

## Deployment

GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages on push to `main`. Uses Node 20.
