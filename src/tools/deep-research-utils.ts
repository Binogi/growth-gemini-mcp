/**
 * Deep Research output derivation.
 *
 * Since Google removed the legacy Interactions "outputs" schema (2026-06-08) the
 * API returns the report as `steps[]`, where the text can be split across several
 * `model_output` steps. The SDK's `output_text` convenience accessor only covers
 * the last of those steps, so a long report is truncated when read from it.
 *
 * `extractOutputs` rebuilds the pre-June-2026 `outputs` shape from `steps`: one
 * `{ type: 'text', text, annotations }` item holding the whole report, with
 * `url_citation` indexes shifted so they still point into the merged text.
 * Downstream consumers that were written against the old shape keep working.
 */

export interface TextAnnotation {
  type?: string
  url?: string
  title?: string
  start_index?: number
  end_index?: number
  [key: string]: unknown
}

export interface TextOutput {
  type: 'text'
  text: string
  annotations?: TextAnnotation[]
}

interface ContentItem {
  type?: string
  text?: string
  annotations?: TextAnnotation[]
}

interface StepLike {
  type?: string
  content?: ContentItem[] | ContentItem
}

/**
 * Merge every text item of every `model_output` step into a single text output.
 * Returns an empty array when the steps carry no model text.
 */
export function extractOutputs(steps: readonly StepLike[] | undefined): TextOutput[] {
  let text = ''
  const annotations: TextAnnotation[] = []

  for (const step of steps || []) {
    if (step.type !== 'model_output') continue
    const items = Array.isArray(step.content) ? step.content : step.content ? [step.content] : []
    for (const item of items) {
      if (item.type !== 'text' || typeof item.text !== 'string') continue
      const offset = text.length
      for (const annotation of item.annotations || []) {
        annotations.push({
          ...annotation,
          ...(typeof annotation.start_index === 'number' && { start_index: annotation.start_index + offset }),
          ...(typeof annotation.end_index === 'number' && { end_index: annotation.end_index + offset }),
        })
      }
      text += item.text
    }
  }

  if (!text) return []
  return [{ type: 'text', text, annotations }]
}

/** The full report text, or an empty string when there is none. */
export function reportText(steps: readonly StepLike[] | undefined): string {
  return extractOutputs(steps)[0]?.text ?? ''
}
