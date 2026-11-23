/**
 * The Claude Code plugins ship bundle/gemini-mcp.mjs with no node_modules next to it
 * (scripts/bundle.mjs). The bundler only sees static imports and literal dynamic imports; a
 * runtime require() of a package is left out and fails at call time. The proxy setup in
 * index.ts did exactly that with undici until 2026-11-23.
 */

import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(full)
    return entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts') ? [full] : []
  })
}

describe('bundle safety', () => {
  it('loads no package through a runtime require', () => {
    const srcDir = path.join(__dirname)
    const offenders = walk(srcDir)
      .filter((file) => {
        const code = fs
          .readFileSync(file, 'utf8')
          .split('\n')
          .filter((line) => !line.trim().startsWith('//'))
          .join('\n')
        return /\bcreateRequire\b|(?<![.\w])require\(/.test(code)
      })
      .map((file) => path.relative(srcDir, file))
    expect(offenders).toEqual([])
  })
})
