/**
 * Bundles dist/index.js and every runtime dependency into bundle/gemini-mcp.mjs, the single file
 * that Binogi's Claude Code plugins ship. Claude Code refuses to install a plugin lockfile that
 * holds a git dependency (seen 2026-11-23 on Claude Code 2.1.330), so the plugins carry this file
 * and install nothing. Also writes bundle/THIRD-PARTY-LICENSES.txt with the license of every
 * package the bundle contains.
 *
 * Run through `npm run build`, after tsc. Output is deterministic: CI rebuilds and diffs it.
 */
import { build } from 'esbuild'
import fs from 'fs'
import path from 'path'
import process from 'process'

const OUT_DIR = 'bundle'
const LICENSE_FILE = /^(licen[cs]e|copying)(\.(md|txt))?$/i

fs.rmSync(OUT_DIR, { recursive: true, force: true })
fs.mkdirSync(OUT_DIR)

const result = await build({
  entryPoints: ['dist/index.js'],
  outfile: `${OUT_DIR}/gemini-mcp.mjs`,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  // CommonJS dependencies call require(); ESM output has none unless we create one.
  banner: {
    js: "import { createRequire as __bundleCreateRequire } from 'module'; const require = __bundleCreateRequire(import.meta.url);",
  },
  // License texts go to THIRD-PARTY-LICENSES.txt instead of inline comments.
  legalComments: 'none',
  metafile: true,
  logLevel: 'warning',
})

// One entry per package directory that contributed a file to the bundle.
const packageDirs = new Set()
for (const input of Object.keys(result.metafile.inputs)) {
  const match = input.match(/^(.*node_modules\/(?:@[^/]+\/)?[^/]+)\//)
  if (match) packageDirs.add(match[1])
}

const sections = [...packageDirs]
  .map((dir) => {
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'))
    const licenseFile = fs.readdirSync(dir).find((name) => LICENSE_FILE.test(name))
    const text = licenseFile
      ? fs.readFileSync(path.join(dir, licenseFile), 'utf8').trim()
      : `No license file in the package; package.json declares: ${pkg.license ?? 'nothing'}`
    return { id: `${pkg.name}@${pkg.version}`, license: pkg.license ?? 'unknown', text }
  })
  .sort((a, b) => a.id.localeCompare(b.id))

const header =
  'Third-party packages bundled into gemini-mcp.mjs, with their licenses.\n' +
  'The bundle itself is built from https://github.com/Binogi/growth-gemini-mcp (MIT).\n'
const body = sections.map((s) => `${'='.repeat(72)}\n${s.id} (${s.license})\n${'='.repeat(72)}\n\n${s.text}\n`)
fs.writeFileSync(`${OUT_DIR}/THIRD-PARTY-LICENSES.txt`, [header, ...body].join('\n'))

const size = fs.statSync(`${OUT_DIR}/gemini-mcp.mjs`).size
process.stderr.write(`bundle: ${OUT_DIR}/gemini-mcp.mjs (${(size / 1e6).toFixed(1)} MB), ${sections.length} packages\n`)
