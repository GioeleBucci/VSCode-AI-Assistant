import { Service } from "./Service";

export interface FileService extends Service {
    /**
     * Gets user-defined instructions from .ai/agentInstructions.md if available
     */
    getUserDefinedInstructions(): string | undefined;

    /**
     * Gets the active text editor
     */
    hasActiveTextEditor(): boolean;

    /**
     * Gets the selected text from the active editor
     * @returns The selected text, or undefined if no editor or no selection
     */
    getEditorSelection(): string | undefined;

    /**
     * Get the whole text content from the active editor
     * @returns The editor content, or undefined if no editor
     */
    getEditorContent(): string | undefined;

    /**
     * Replaces the selected text in the active editor
     * @param newText The new text to replace the selection with
     * @returns True if the replacement was successful
     */
    replaceSelectedText(newText: string): Promise<boolean>;

    /**
     * Replaces the entire content of the active file
     * @param newText The new text to replace the entire file content with
     * @returns True if the replacement was successful
     */
    replaceFileContent(newText: string): Promise<boolean>;

    /**
     * Gets the base name of a file from its path
     * @param filePath The file path
     * @returns The base name of the file
     */
    getFileName(filePath: string): string;

    /**
     * Gets the file extension from a file path (without the leading dot)
     * @param filePath The file path
     * @returns The file extension, or empty string if none
     */
    getFileExtension(filePath: string): string;

    /**
     * Reads the content of a file, prioritizing the active editor if open
     * @param filePath The absolute path to the file
     * @returns The file content, or undefined if the file cannot be read
     */
    getFileContent(filePath: string): string | undefined;
}
