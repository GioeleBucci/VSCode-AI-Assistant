import * as vscode from "vscode";
import { ChatContextManager } from "./api/ChatContextManager";
import { FileService } from "../services/api/FileService";
import { LoggingService } from "../services/api/LoggingService";

/**
 * Manages the chat's context
 */
export class ChatContextManagerImpl
    implements ChatContextManager, vscode.Disposable
{
    private editorChangeDisposable?: vscode.Disposable;
    private webview?: vscode.WebviewView;

    constructor(
        private readonly fileService: FileService,
        private readonly logger?: LoggingService
    ) {}

    public setWebview(webview: vscode.WebviewView): void {
        this.webview = webview;
        // register listener for active editor changes
        this.editorChangeDisposable = vscode.window.onDidChangeActiveTextEditor(
            this.updateCurrentFile,
            this
        );
        // immediately update webview with current file
        this.updateCurrentFile(vscode.window.activeTextEditor);
    }

    public async handleFileSelection(): Promise<void> {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showWarningMessage(
                    "No workspace folders found. Please open a folder first."
                );
                return;
            }

            // open native file picker
            const selectedUris = await vscode.window.showOpenDialog({
                canSelectMany: true,
                canSelectFiles: true,
                canSelectFolders: false,
                defaultUri: workspaceFolders[0].uri,
                openLabel: "Select",
                title: "Add file(s) to the context",
            });

            // if user selected files
            if (selectedUris && selectedUris.length > 0) {
                for (const selectedUri of selectedUris) {
                    const filePath = selectedUri.fsPath;

                    // send file path to webview
                    if (this.webview) {
                        this.webview.webview.postMessage({
                            type: "addFile",
                            filePath: filePath,
                        });
                    }
                }
            }
        } catch (error) {
            this.logger?.error(
                "Failed to add file to chat context,",
                error as Error
            );
        }
    }

    public sendCurrentFileToWebview(): void {
        this.updateCurrentFile(vscode.window.activeTextEditor);
    }

    public buildContextualMessage(
        userMessage: string,
        contextFiles: string[]
    ): string {
        if (contextFiles.length === 0) {
            return userMessage;
        }

        this.logger?.debug(
            `Building contextual message with ${contextFiles.length} files`
        );

        let enhancedMessage = "I have the following file(s) for context:\n\n";

        // load the latest content for each file
        for (const filePath of contextFiles) {
            const fileName = this.fileService.getFileName(filePath);
            const fileContent = this.fileService.getFileContent(filePath);
            const language = this.fileService.getFileExtension(filePath);

            if (fileContent) {
                enhancedMessage += `File: ${fileName} (${language})\n\`\`\`${language}\n${fileContent}\n\`\`\`\n\n`;
            } else {
                this.logger?.error(`Could not read file: ${filePath}`);
                enhancedMessage += `File: ${fileName} (could not be read)\n\n`;
            }
        }

        enhancedMessage += `My question is: ${userMessage}`;
        return enhancedMessage;
    }

    // updates the current file when the active editor changes
    private updateCurrentFile(editor?: vscode.TextEditor): void {
        if (
            editor &&
            editor.document &&
            editor.document.uri.scheme === "file"
        ) {
            const filePath = editor.document.uri.fsPath;

            // update webview with current file path
            if (this.webview) {
                this.webview.webview.postMessage({
                    type: "updateCurrentFile",
                    filePath: filePath,
                });
            }
        } else {
            // no file to show, update webview accordingly
            if (this.webview) {
                this.webview.webview.postMessage({
                    type: "updateCurrentFile",
                    filePath: null,
                });
            }
        }
    }

    public dispose(): void {
        this.editorChangeDisposable?.dispose();
    }
}
