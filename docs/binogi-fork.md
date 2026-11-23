# Binogi fork of gemini-mcp

This repository is `Binogi/growth-gemini-mcp`, a fork of
[`RLabs-Inc/gemini-mcp`](https://github.com/RLabs-Inc/gemini-mcp) maintained by the growth team.
It exists so that Binogi's Claude Code plugins (`binogi-research`, `binogi-gemini-lab` in
`Binogi/claude-plugins`) can install a known-good build of the server, and so that the fixes and
features we need ship on our schedule. Changes land only here; nothing is sent upstream.

## What differs from upstream

Fix and feature commits:

- `fix(models)`: pro default `gemini-3.1-pro-preview`; all model defaults in `src/models.ts`.
- `fix(deep-research)`: `outputs[]` derived from `steps[]` so the whole report survives.
- `docs(deep-research)`: tool descriptions state when the result JSON is written.
- `fix(thinking)`: the fast slot sends `low` when `minimal` is requested; Gemini 4 rejects `minimal`.
- `feat(models)`: `GEMINI_DEEP_MODEL` and `GEMINI_FAST_MODEL` name the text-model slots by role,
  with `GEMINI_PRO_MODEL` and `GEMINI_FLASH_MODEL` kept as fallbacks; defaults `gemini-4-carbon`
  (deep) and `gemini-4-neon` (fast).

Packaging commits:

- `build: run scripts and hooks with npm instead of bun` (npm scripts, `.npmrc`, engines, lockfile).
- `build: track dist for git-dependency installs` (`dist/` is committed).
- `ci: typecheck, test, and verify dist is fresh` (`.github/workflows/ci.yml`).
- this document.

Releases so far: `v0.8.1-binogi.1` (2026-08-27, first plugin release), `v0.8.1-binogi.2`
(2026-08-27, citation indexes shifted in UTF-8 bytes; check-research description corrected),
`v0.8.1-binogi.3` (2026-11-23, deep and fast model variables, Gemini 4 defaults, `minimal` sent
as `low` on the fast slot).

[RLabs-Inc/gemini-mcp#35](https://github.com/RLabs-Inc/gemini-mcp/pull/35) predates the rule against
upstream PRs and is left open; its changes are already on this fork's `main`.

## Rules

- The npm package name stays `@rlabs-inc/gemini-mcp`. Never publish from this fork; the plugins
  consume git tags.
- `dist/` is tracked. Every commit that changes `src/` rebuilds and commits `dist/` (CI fails
  otherwise). `npm run build` is a clean build.
- No PRs to `RLabs-Inc/gemini-mcp`. Every change goes through a PR to this fork's `main`. Upstream
  changes still come in through the sync recipe below.
- Tags are `v<upstream package version>-binogi.<n>`, for example `v0.8.1-binogi.1`. A tag is a
  release: the plugins pin one.

## How the plugins consume this repo

Each plugin has a `package.json` with
`"@rlabs-inc/gemini-mcp": "github:Binogi/growth-gemini-mcp#<tag>"`, a lockfile, and an `.npmrc`
(`allow-git=root`, `legacy-peer-deps=true`). Claude Code runs `npm ci --ignore-scripts` in the
plugin cache on install, so no build happens on the developer's machine; the plugin then starts
`node ${CLAUDE_PLUGIN_ROOT}/node_modules/@rlabs-inc/gemini-mcp/dist/index.js`.

## Recipes

### Cut a release

```bash
npm ci && npm run typecheck && npm test
npm run build && git status --porcelain -- dist   # must be empty, else commit dist first
git tag v0.8.1-binogi.2                            # bump the -binogi.<n> counter
git push origin main --tags
```

Then bump the tag in each plugin's `package.json`, regenerate its `package-lock.json` with
`rm -rf node_modules package-lock.json && npm install --ignore-scripts --package-lock-only`
(npm keeps an installed git dependency when the spec is a tag, so a stale `node_modules` pins
the old commit), check `resolved` ends in `git rev-parse <tag>^{commit}`, and bump the plugin
version.

### Sync with upstream

```bash
git fetch --multiple origin upstream
git switch -c <initials>.dev.upstream-sync origin/main
git merge upstream/main
npm ci && npm run build && npm test
git add dist && git commit -m "build: rebuild dist after upstream sync"
git push -u origin HEAD            # then open a PR to main
```

Merge, never rebase: `main` carries the release tags the plugins pin, and a rebase would leave
them off the branch. If upstream fixed something the fork already fixed, keep one version while
resolving the merge. Keep the packaging commits.

### Local development

`npm run dev` runs `tsc --watch`; in a second terminal `node --watch dist/index.js`. To test the
server inside Claude Code without the plugin, register it once:
`claude mcp add gemini-dev -s user -- env GEMINI_API_KEY=$GEMINI_API_KEY node $PWD/dist/index.js`.
