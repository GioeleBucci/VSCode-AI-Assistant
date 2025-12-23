import * as vscode from "vscode";

/**
 * Interface for providing HTML content for a webview
 */
export interface WebpageProvider {
    getHtmlContent(webview: vscode.Webview): string;
}
