import * as vscode from "vscode";
import { WebpageProvider } from "./api/WebpageProvider";

export class ChatWebpageProvider implements WebpageProvider {
    constructor(private readonly extensionUri: vscode.Uri) {}

    /**
     * Generates HTML for the chat webview
     */
    public getHtmlContent(webview: vscode.Webview): string {
        // construct URIs for scripts and styles
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, "media", "main.js")
        );
        const styleResetUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, "media", "reset.css")
        );
        const styleMainUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, "media", "main.css")
        );
        // add fontello icons
        const fontelloCssUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.extensionUri,
                "media",
                "icons",
                "css",
                "fontello.css"
            )
        );

        // get local paths for highlight.js and marked.js from vendor folder
        const highlightCssUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.extensionUri,
                "media",
                "vendor",
                "github-dark.min.css"
            )
        );
        const markedScriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.extensionUri,
                "media",
                "vendor",
                "marked.min.js"
            )
        );
        const highlightScriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(
                this.extensionUri,
                "media",
                "vendor",
                "highlight.min.js"
            )
        );

        const nonce = this.getNonce();

        return /*html*/ `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
                    Use a content security policy to only loading from our extension directory and only allow scripts that have a specific nonce.
					(Based on the 'webview-sample' extension sample by Microsoft)
				-->
                <meta http-equiv="Content-Security-Policy" content="
                    default-src 'none'; 
                    script-src 'nonce-${nonce}'; 
                    style-src ${webview.cspSource}; 
                    img-src ${webview.cspSource}; 
                    font-src ${webview.cspSource};
                ">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
                <link href="${fontelloCssUri}" rel="stylesheet">
                <!-- Add Highlight.js and marked.js (both bundled locally) -->
                <link href="${highlightCssUri}" rel="stylesheet">
                <script nonce="${nonce}" src="${markedScriptUri}"></script>
                <script nonce="${nonce}" src="${highlightScriptUri}"></script>
			</head>
			<body>
                <div class="chat-container">
                    <div class="chat-messages" id="chat-messages">
                        <!-- messages will be added here dynamically -->
                    </div>
                    <div class="current-file-container" id="current-file-container">
                        <!-- currently open file will be shown here -->
                    </div>
                    <div class="active-files-container" id="active-files-container">
                        <!-- active file references will be shown here -->
                    </div>
                    <div class="chat-input-container">
                        <div class="input-wrapper">
                            <textarea id="chat-input" placeholder="Type a message... (Shift+Enter for new line)"></textarea>
                            <div class="input-actions-panel">
                                <div class="input-actions-container">
                                    <button id="add-file-button" class="action-button" title="Add a file for context">
                                        <i class="icon-attach-1"></i>
                                    </button>
                                    <button id="toggle-grounding-button" class="action-button" title="Toggle search grounding">
                                        <i class="icon-globe"></i>
                                    </button>
                                </div>
                                <button id="send-button" class="send-button" title="Send message">
                                    <i class="icon-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
    }

    /**
     * Generates a random nonce for script security
     */
    private getNonce(): string {
        let text = "";
        const possible =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(
                Math.floor(Math.random() * possible.length)
            );
        }
        return text;
    }
}
