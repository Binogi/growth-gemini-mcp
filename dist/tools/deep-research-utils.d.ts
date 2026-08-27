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
 * The API measures `start_index`/`end_index` in UTF-8 bytes, so the shift is the
 * byte length of the preceding text, not its `.length` (UTF-16 code units).
 * Downstream consumers that were written against the old shape keep working.
 */
export interface TextAnnotation {
    type?: string;
    url?: string;
    title?: string;
    start_index?: number;
    end_index?: number;
    [key: string]: unknown;
}
export interface TextOutput {
    type: 'text';
    text: string;
    annotations?: TextAnnotation[];
}
interface ContentItem {
    type?: string;
    text?: string;
    annotations?: TextAnnotation[];
}
interface StepLike {
    type?: string;
    content?: ContentItem[] | ContentItem;
}
/**
 * Merge every text item of every `model_output` step into a single text output.
 * Returns an empty array when the steps carry no model text.
 */
export declare function extractOutputs(steps: readonly StepLike[] | undefined): TextOutput[];
/** The full report text, or an empty string when there is none. */
export declare function reportText(steps: readonly StepLike[] | undefined): string;
export {};
