import * as vscode from "vscode";

export interface WebviewManager {
    activate(context: vscode.ExtensionContext): void;
}
