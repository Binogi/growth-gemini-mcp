/**
 * Model defaults, resolved in one place.
 *
 * Google retires preview model IDs without notice in the models list metadata
 * (`gemini-3-pro-preview` started returning 404 in August 2026). Keeping the
 * fallbacks here means a retirement is a one-line change instead of a hunt
 * through every tool file. Env vars override at call time.
 */
export declare const DEFAULT_PRO_MODEL = "gemini-3.1-pro-preview";
export declare const DEFAULT_FLASH_MODEL = "gemini-3-flash-preview";
export declare const DEFAULT_IMAGE_MODEL = "gemini-3-pro-image-preview";
export declare const DEFAULT_VIDEO_MODEL = "veo-2.0-generate-001";
export declare const proModel: () => string;
export declare const flashModel: () => string;
export declare const imageModel: () => string;
export declare const videoModel: () => string;
