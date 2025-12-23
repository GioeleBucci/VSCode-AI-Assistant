import * as vscode from "vscode";

/**
 * Interface for managing chat context (current file tracking)
 */
export interface ChatContextManager {
    /**
     * Sets the webview to communicate with
     */
    setWebview(webview: vscode.WebviewView): void;

    /**
     * Handles file selection for the chat context
     */
    handleFileSelection(): Promise<void>;

    /**
     * Send current file state to webview
     */
    sendCurrentFileToWebview(): void;

    /**
     * Builds a contextual message including references to the provided context files
     * @param userMessage The user's message
     * @param contextFiles Array of file paths to include in the context
     */
    buildContextualMessage(
        userMessage: string,
        contextFiles: string[]
    ): string;
}
