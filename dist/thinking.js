/**
 * Thinking-level mapping for the fast model slot.
 *
 * Gemini 3 Flash accepted 'minimal'; Gemini 4 models reject it with HTTP 400
 * (verified 2026-11-23 on gemini-4-carbon and gemini-4-neon). The fast slot
 * therefore sends 'low' in its place, which every current text model accepts.
 */
export const fastThinkingLevel = (level) => (level === 'minimal' ? 'low' : level);
/** Log text for a thinking level, naming the requested level whenever a slot remapped it. */
export const describeThinkingLevel = (effective, requested) => effective === requested ? effective : `${effective} (requested: ${requested})`;
