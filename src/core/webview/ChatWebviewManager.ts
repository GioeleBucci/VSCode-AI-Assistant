import * as vscode from "vscode";
import { WebviewManager } from "./api/WebviewManager";
import { ServiceContainer } from "../services/api/ServiceContainer";
import { ChatViewProvider } from "./ChatViewProvider";

export class ChatWebviewManager implements WebviewManager {
    private provider?: ChatViewProvider;

    constructor(
        private readonly serviceContainer: ServiceContainer,
        // needed to load static resources into the webview.
        private readonly extensionUri: vscode.Uri
    ) {}

    public activate(context: vscode.ExtensionContext): void {
        // first create the view provider
        this.provider = new ChatViewProvider(
            this.extensionUri,
            this.serviceContainer.resolve("ChatService"),
        );
        // then register it with VS Code
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(
                ChatViewProvider.viewID,
                this.provider
            )
        );

        context.subscriptions.push(this.provider);
    }
}
