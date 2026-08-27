/**
 * Tool Groups Configuration
 *
 * Defines tool group mappings and presets for selective tool loading.
 * Environment variables:
 * - GEMINI_ENABLED_TOOLS: Comma-separated list of group IDs to enable
 * - GEMINI_TOOL_PRESET: Preset profile name (minimal, text, image, research, media, full)
 */
export declare const TOOL_GROUPS: Record<string, {
    registerFn: string;
    tools: string[];
}>;
export declare const PRESETS: Record<string, string[]>;
/**
 * Get the set of enabled tool group IDs based on environment configuration.
 */
export declare function getEnabledToolGroups(): Set<string>;
