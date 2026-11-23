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
- `build: ship the server as one bundled file` (`scripts/bundle.mjs`, `bundle/` is committed,
  `scripts/smoke-bundle.sh` in CI; `undici` imported statically so the bundle carries it).
- this document.

Releases so far: `v0.8.1-binogi.1` (2026-08-27, first plugin release), `v0.8.1-binogi.2`
(2026-08-27, citation indexes shifted in UTF-8 bytes; check-research description corrected),
`v0.8.1-binogi.3` (2026-11-23, deep and fast model variables, Gemini 4 defaults, `minimal` sent
as `low` on the fast slot), `v0.8.1-binogi.4` (2026-11-23, single-file bundle for the plugins).

[RLabs-Inc/gemini-mcp#35](https://github.com/RLabs-Inc/gemini-mcp/pull/35) predates the rule against
upstream PRs and is left open; its changes are already on this fork's `main`.

## Rules

- The npm package name stays `@rlabs-inc/gemini-mcp`. Never publish from this fork; the plugins
  copy the bundle from a tag.
- `dist/` and `bundle/` are tracked. Every commit that changes `src/` or the dependencies runs
  `npm run build` and commits both (CI fails otherwise). The build is clean and deterministic.
- Load packages with static imports or literal dynamic imports only. The bundler cannot see a
  runtime `require()`, so that package is missing from the bundle; `src/bundle.test.ts` fails on
  one.
- No PRs to `RLabs-Inc/gemini-mcp`. Every change goes through a PR to this fork's `main`. Upstream
  changes still come in through the sync recipe below.
- Tags are `v<upstream package version>-binogi.<n>`, for example `v0.8.1-binogi.1`. A tag is a
  release: the plugins pin one.

## How the plugins consume this repo

Each plugin carries a copy of `bundle/gemini-mcp.mjs` and `bundle/THIRD-PARTY-LICENSES.txt` from
a tag, in its `server/` directory, and starts `node ${CLAUDE_PLUGIN_ROOT}/server/gemini-mcp.mjs`.
The plugins have no `package.json`, so Claude Code installs nothing and the developer needs only
Node 20 or later.

Until 2026-11-23 the plugins listed this repo as a git dependency and let Claude Code install it.
Claude Code 2.1.330 refuses that: `claude plugin list` reports "its package-lock.json has a
dependency that is not a registry package and version range", and the plugin starts with no
server. A fresh install of the old 1.0.0 plugins fails the same way.

## Recipes

### Cut a release

```bash
npm ci && npm run typecheck && npm test
npm run build && git status --porcelain -- dist bundle   # must be empty, else commit first
scripts/smoke-bundle.sh
git tag v0.8.1-binogi.4                                  # bump the -binogi.<n> counter
git push origin v0.8.1-binogi.4
```

Then, in `Binogi/claude-plugins`, run `scripts/vendor-gemini-mcp.sh <tag>` and follow that repo's
release checklist.

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
