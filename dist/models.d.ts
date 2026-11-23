/**
 * Model defaults, resolved in one place.
 *
 * Google retires preview model IDs without notice in the models list metadata
 * (`gemini-3-pro-preview` started returning 404 in August 2026). Keeping the
 * fallbacks here means a retirement is a one-line change instead of a hunt
 * through every tool file. Env vars override at call time.
 *
 * GEMINI_DEEP_MODEL and GEMINI_FAST_MODEL name the two text-model slots by role
 * rather than by Google's tier names, so a new model family needs no rename.
 * The older GEMINI_PRO_MODEL and GEMINI_FLASH_MODEL still work as fallbacks.
 */
export declare const DEFAULT_PRO_MODEL = "gemini-4-carbon";
export declare const DEFAULT_FLASH_MODEL = "gemini-4-neon";
export declare const DEFAULT_IMAGE_MODEL = "gemini-3-pro-image-preview";
export declare const DEFAULT_VIDEO_MODEL = "veo-2.0-generate-001";
export declare const proModel: () => string;
export declare const flashModel: () => string;
export declare const imageModel: () => string;
export declare const videoModel: () => string;
