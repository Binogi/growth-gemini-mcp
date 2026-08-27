/**
 * Tests for the deep-research output derivation.
 *
 * Fixture mirrors the Interactions API "steps" layout observed on 2026-08-27:
 * the report arrives as text content spread over several model_output steps,
 * one of which also carries an image, and each text item may carry url_citation
 * annotations whose indexes are relative to that item.
 */

import { describe, it, expect } from 'vitest'
import { extractOutputs, reportText } from '../deep-research-utils.js'

const partA = '# Report\n\nFirst half — with “curly quotes” and Ünïcödé.\n\n' // non-ASCII: bytes > chars
const partABytes = Buffer.byteLength(partA, 'utf8')
const partB = '## Section 2\n\nSecond half [^1].\n\n[^1]: https://example.org/a'

const steps = [
  { type: 'user_input', content: [{ type: 'text', text: 'the prompt' }] },
  { type: 'thought', signature: '', summary: [{ type: 'text', text: 'planning' }] },
  { type: 'model_output', content: [{ type: 'text', text: partA }] },
  {
    type: 'model_output',
    content: [
      { type: 'image', mime_type: 'image/png', data: 'AAAA' },
      {
        type: 'text',
        text: partB,
        annotations: [{ type: 'url_citation', url: 'https://example.org/a', start_index: 15, end_index: 26 }],
      },
    ],
  },
]

describe('extractOutputs', () => {
  it('merges every model_output text item into one text output, in order', () => {
    const outputs = extractOutputs(steps)
    expect(outputs).toHaveLength(1)
    expect(outputs[0].type).toBe('text')
    expect(outputs[0].text).toBe(partA + partB)
  })

  it('ignores user_input, thought, and image content', () => {
    const [output] = extractOutputs(steps)
    expect(output.text).not.toContain('the prompt')
    expect(output.text).not.toContain('planning')
    expect(output.text).not.toContain('AAAA')
  })

  it('shifts annotation indexes by the UTF-8 byte length of the preceding text', () => {
    expect(partABytes).toBeGreaterThan(partA.length) // the fixture must exercise the difference
    const [output] = extractOutputs(steps)
    expect(output.annotations).toEqual([
      {
        type: 'url_citation',
        url: 'https://example.org/a',
        start_index: partABytes + 15,
        end_index: partABytes + 26,
      },
    ])
    // The API measures indexes in bytes; slicing the UTF-8 bytes must land on the cited span.
    const bytes = Buffer.from(output.text, 'utf8')
    const { start_index, end_index } = output.annotations![0]
    expect(bytes.subarray(start_index!, end_index!).toString('utf8')).toBe(partB.slice(15, 26))
  })

  it('returns an empty list when no model_output text exists', () => {
    expect(extractOutputs([steps[0], steps[1]])).toEqual([])
    expect(extractOutputs(undefined)).toEqual([])
  })
})

describe('reportText', () => {
  it('returns the merged report text', () => {
    expect(reportText(steps)).toBe(partA + partB)
  })

  it('returns an empty string when there is no text', () => {
    expect(reportText([])).toBe('')
  })
})
