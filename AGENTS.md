# Repository Guidelines

## Project Structure & Modules

- `app/[locale]/` hosts locale-aware routes; `layout.tsx` shares the shell and `page.tsx` drives the landing view.
- `components/` stores reusable UI primitives in `PascalCase.tsx` files.
- `lib/` collects helpers (`i18n`, `maps`, `utils`); keep domain logic closest to calling features.
- `data/` holds UNESCO XML sources plus generated `sites.json`; `public/` exposes static assets.

## Build & Data Commands

- `npm run dev` / `npm run dev:turbo`: start the dev server (standard or Turbopack).
- `npm run build` then `npm run start`: validate the production bundle and smoke-test the output.
- `npm run lint`, `npm run type-check`, `npm run format`: enforce linting, typing, and formatting.
- `npm run prepare:data`: refresh `data/sites.json` via `scripts/prepare-data.ts`.

## Coding Style & Dependencies

- Prefer TypeScript everywhere; avoid plain JS unless interop requires it.
- Follow 2-space indentation and functional React patterns; compose UI with Tailwind and group classes layout → spacing → color.
- External strings must flow through `lib/i18n`; add locales in sync.
- Choose stable, well-maintained libraries; upgrade to the latest non-breaking release as soon as practical.

## Testing & QA

- Automated tests are pending; colocate future specs as `.test.ts(x)` beside the source they cover.
- Until tooling lands, run lint, type-check, and manual passes in `/en` and `/zh`; record manual steps in PRs.

## Collaboration Workflow

- With a single maintainer + AI, favor solutions that stay simple to operate and maintain.
- Use branches named `feat/...`, `fix/...`, `doc/...`, or `chore/...`; rebase before opening PRs.
- Bug fixes need prior consensus unless they unblock broken builds or compilation.
- Avoid creating new standalone `.md` files without agreement; extend existing docs instead.

## Commit & PR Standards

- Follow Conventional Commits with focused scope and imperative language.
- PRs must include a concise summary, linked issues, and visual evidence when UI shifts.
- Confirm `npm run build` passes and commit regenerated artifacts such as `data/sites.json`.

## Localization & Data Notes

- New routes must ship with every locale under `app/[locale]` before release.
- When regenerating data, cite UNESCO inputs in the PR and note how `npm run prepare:data` was validated.
