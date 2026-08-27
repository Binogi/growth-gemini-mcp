# Binogi fork of gemini-mcp

This repository is `Binogi/growth-gemini-mcp`, a fork of
[`RLabs-Inc/gemini-mcp`](https://github.com/RLabs-Inc/gemini-mcp) maintained by the growth team.
It exists so that Binogi's Claude Code plugins (`binogi-research`, `binogi-gemini-lab` in
`Binogi/claude-plugins`) can install a known-good build of the server, and so that fixes we need
can ship before upstream merges them.

## What differs from upstream

Fix commits (also offered upstream, see the PR list below):

- `fix(models)`: pro default `gemini-3.1-pro-preview`; all model defaults in `src/models.ts`.
- `fix(deep-research)`: `outputs[]` derived from `steps[]` so the whole report survives.
- `docs(deep-research)`: tool descriptions state when the result JSON is written.

Fork-only packaging commits (never sent upstream):

- `build: run scripts and hooks with npm instead of bun` (npm scripts, `.npmrc`, engines, lockfile).
- `build: track dist for git-dependency installs` (`dist/` is committed).
- `ci: typecheck, test, and verify dist is fresh` (`.github/workflows/ci.yml`).
- this document.

Upstream PRs opened from this fork: [RLabs-Inc/gemini-mcp#35](https://github.com/RLabs-Inc/gemini-mcp/pull/35).

## Rules

- The npm package name stays `@rlabs-inc/gemini-mcp`. Never publish from this fork; the plugins
  consume git tags.
- `dist/` is tracked. Every commit that changes `src/` rebuilds and commits `dist/` (CI fails
  otherwise). `npm run build` is a clean build.
- Fix commits that could apply upstream go on their own branch and PR first; packaging commits
  stay on `main` only.
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

Then bump the tag in each plugin's `package.json`, regenerate its `package-lock.json`
(`npm install --ignore-scripts --package-lock-only`), and bump the plugin version.

### Sync with upstream

```bash
git fetch upstream
git rebase upstream/main          # or merge, if the fix branch has been merged upstream
npm ci && npm run build && npm test
git add dist && git commit -m "build: rebuild dist after upstream sync"
git push --force-with-lease origin main   # only if you rebased
```

Drop fork fix commits that upstream has merged. Keep the packaging commits.

### Local development

`npm run dev` runs `tsc --watch`; in a second terminal `node --watch dist/index.js`. To test the
server inside Claude Code without the plugin, register it once:
`claude mcp add gemini-dev -s user -- env GEMINI_API_KEY=$GEMINI_API_KEY node $PWD/dist/index.js`.
