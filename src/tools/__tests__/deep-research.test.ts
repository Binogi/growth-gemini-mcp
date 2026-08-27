/**
 * The deep-research tools must tell callers when and where the result file
 * appears: gemini-check-research writes it the moment it observes completion,
 * nothing runs in the background, and the name is timestamped. Callers who
 * watch the output directory instead of polling wait forever.
 */

import { describe, it, expect, vi } from 'vitest'

vi.mock('../../gemini-client.js', () => ({
  startDeepResearch: vi.fn(),
  checkDeepResearch: vi.fn(),
  followUpResearch: vi.fn(),
}))

import { registerDeepResearchTool } from '../deep-research.js'

function registeredDescriptions(): Record<string, string | undefined> {
  const tool = vi.fn()
  registerDeepResearchTool({ tool } as never)
  return Object.fromEntries(
    tool.mock.calls.map((args: unknown[]) => [args[0] as string, typeof args[1] === 'string' ? args[1] : undefined])
  )
}

describe('deep-research tool descriptions', () => {
  it('registers all three tools with a description', () => {
    const descriptions = registeredDescriptions()
    expect(Object.keys(descriptions).sort()).toEqual([
      'gemini-check-research',
      'gemini-deep-research',
      'gemini-research-followup',
    ])
    for (const text of Object.values(descriptions)) expect(text).toBeTruthy()
  })

  it('tells callers the JSON is written only when check-research observes completion', () => {
    const descriptions = registeredDescriptions()
    expect(descriptions['gemini-deep-research']).toMatch(/gemini-check-research/)
    expect(descriptions['gemini-deep-research']).toMatch(/not.*(watch|background)/i)
    expect(descriptions['gemini-check-research']).toMatch(/writes?.*JSON/i)
    expect(descriptions['gemini-check-research']).toMatch(/outputs/)
  })
})
