/**
 * Model defaults, resolved in one place.
 *
 * Google retires preview model IDs without notice in the models list metadata
 * (`gemini-3-pro-preview` started returning 404 in August 2026). Keeping the
 * fallbacks here means a retirement is a one-line change instead of a hunt
 * through every tool file. Env vars override at call time.
 */

export const DEFAULT_PRO_MODEL = 'gemini-3.1-pro-preview'
export const DEFAULT_FLASH_MODEL = 'gemini-3-flash-preview'
export const DEFAULT_IMAGE_MODEL = 'gemini-3-pro-image-preview'
export const DEFAULT_VIDEO_MODEL = 'veo-2.0-generate-001'

export const proModel = (): string => process.env.GEMINI_PRO_MODEL || DEFAULT_PRO_MODEL
export const flashModel = (): string => process.env.GEMINI_FLASH_MODEL || DEFAULT_FLASH_MODEL
export const imageModel = (): string => process.env.GEMINI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL
export const videoModel = (): string => process.env.GEMINI_VIDEO_MODEL || DEFAULT_VIDEO_MODEL
