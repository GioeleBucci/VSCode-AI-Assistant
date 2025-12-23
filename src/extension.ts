import * as vscode from "vscode";
import { ExtensionManager } from "./core/manager/api/ExtensionManager";
import { ExtensionManagerImpl } from "./core/manager/ExtensionManagerImpl";

let extensionManager: ExtensionManager;

// extension's entry point
export function activate(context: vscode.ExtensionContext): void {
    extensionManager = new ExtensionManagerImpl(context);
    extensionManager.activate();
}

export function deactivate(): void {
    extensionManager?.deactivate();
}
