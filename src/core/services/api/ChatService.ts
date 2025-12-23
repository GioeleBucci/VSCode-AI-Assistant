import * as vscode from "vscode";
import { Service } from "./Service";

export interface ChatService extends Service {
    setWebview(webview: vscode.WebviewView): void;
    handleWebviewMessage(data: any): Promise<void>;
    clearChat(): Promise<void>;
}
