/**
 * Gemini 4 models reject thinkingLevel 'minimal' with HTTP 400 ("Thinking
 * level MINIMAL is not supported for this model"), verified 2026-11-23 on
 * gemini-4-carbon and gemini-4-neon. The fast slot passed it through
 * unchanged, so any tool call asking for 'minimal' failed.
 */

import { describe, it, expect } from 'vitest'
import { fastThinkingLevel, describeThinkingLevel } from './thinking.js'

describe('fastThinkingLevel', () => {
  it('sends low when minimal is requested', () => {
    expect(fastThinkingLevel('minimal')).toBe('low')
  })

  it('passes every other level through', () => {
    for (const level of ['low', 'medium', 'high'] as const) {
      expect(fastThinkingLevel(level)).toBe(level)
    }
  })
})

describe('describeThinkingLevel', () => {
  it('names the requested level when it was remapped', () => {
    expect(describeThinkingLevel('low', 'minimal')).toBe('low (requested: minimal)')
  })

  it('names only the level when nothing was remapped', () => {
    expect(describeThinkingLevel('high', 'high')).toBe('high')
  })
})
