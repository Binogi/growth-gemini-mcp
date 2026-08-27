/**
 * Analyze Tool Utilities - Pure functions for code analysis prompt construction
 *
 * These utility functions are extracted for testability and reusability.
 * They have no external dependencies beyond Node.js built-ins.
 */
import * as fs from 'fs';
/**
 * Maximum file size for code analysis (20MB)
 */
export declare const MAX_FILE_SIZE: number;
/**
 * Focus areas for code analysis
 */
export type AnalysisFocus = 'quality' | 'security' | 'performance' | 'bugs' | 'general';
/**
 * Represents a file's content for analysis
 */
export interface FileContent {
    filename: string;
    content: string;
    ext: string;
}
/**
 * Input parameters for code analysis
 */
export interface CodeAnalysisInput {
    code?: string;
    filePath?: string;
    filePaths?: string[];
    language?: string;
    focus: AnalysisFocus;
}
/**
 * Result of building the analysis prompt
 */
export interface PromptBuildResult {
    prompt: string;
    fileCount: number;
    hasInlineCode: boolean;
}
/**
 * File system interface for dependency injection (testing)
 */
export interface FileSystemLike {
    existsSync: typeof fs.existsSync;
    statSync: typeof fs.statSync;
    readFileSync: typeof fs.readFileSync;
}
/**
 * Normalize file paths from inputs - coerce filePath to array, merge with filePaths
 */
export declare function normalizeFilePaths(filePath?: string, filePaths?: string[]): string[];
/**
 * Read and validate files for analysis
 * @throws Error if file not found or too large
 */
export declare function readFilesForAnalysis(paths: string[], fileSystem?: FileSystemLike): FileContent[];
/**
 * Build the code section of the prompt from file contents and inline code
 */
export declare function buildCodeSection(fileContents: FileContent[], code?: string, language?: string): string;
/**
 * Build the analysis target text based on file count and language
 */
export declare function buildAnalysisTarget(fileCount: number, language?: string): string;
/**
 * Get the focus-specific instructions for the analysis
 */
export declare function getFocusInstructions(focus: AnalysisFocus): string;
/**
 * Build the complete analysis prompt
 * @throws Error if no code provided
 */
export declare function buildAnalysisPrompt(fileContents: FileContent[], code?: string, language?: string, focus?: AnalysisFocus): PromptBuildResult;
