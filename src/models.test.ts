/**
 * Model defaults live in one place so a retired model ID is a one-line change.
 * Regression guard for the 2026-08-27 failure where `gemini-3-pro-preview` was
 * retired by Google (404) while it remained hard-coded in a dozen tool files.
 */

import { describe, it, expect, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { DEFAULT_PRO_MODEL, DEFAULT_FLASH_MODEL, proModel, flashModel, imageModel } from './models.js'

const RETIRED = ['gemini-3-pro-preview']

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(full)
    return entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts') ? [full] : []
  })
}

describe('model defaults', () => {
  const saved = { ...process.env }
  afterEach(() => {
    process.env = { ...saved }
  })

  it('does not default to a retired model', () => {
    for (const id of RETIRED) {
      expect(DEFAULT_PRO_MODEL).not.toBe(id)
      expect(DEFAULT_FLASH_MODEL).not.toBe(id)
    }
  })

  it('resolves defaults when no env override is set', () => {
    delete process.env.GEMINI_PRO_MODEL
    delete process.env.GEMINI_FLASH_MODEL
    expect(proModel()).toBe(DEFAULT_PRO_MODEL)
    expect(flashModel()).toBe(DEFAULT_FLASH_MODEL)
  })

  it('honours env overrides at call time', () => {
    process.env.GEMINI_PRO_MODEL = 'pro-override'
    process.env.GEMINI_FLASH_MODEL = 'flash-override'
    process.env.GEMINI_IMAGE_MODEL = 'image-override'
    expect(proModel()).toBe('pro-override')
    expect(flashModel()).toBe('flash-override')
    expect(imageModel()).toBe('image-override')
  })

  it('keeps every text-model default out of the tool files', () => {
    const srcDir = path.join(__dirname)
    const offenders = walk(srcDir)
      .filter((file) => path.basename(file) !== 'models.ts')
      .filter((file) => {
        const text = fs.readFileSync(file, 'utf8')
        return (
          RETIRED.some((id) => text.includes(id)) ||
          /process\.env\.GEMINI_(PRO|FLASH|IMAGE|VIDEO)_MODEL\s*\|\|\s*'(gemini|veo)-/.test(text)
        )
      })
      .map((file) => path.relative(srcDir, file))
    expect(offenders).toEqual([])
  })
})
