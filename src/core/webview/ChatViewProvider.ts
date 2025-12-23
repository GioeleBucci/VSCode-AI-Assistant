import * as vscode from "vscode";
import { ChatService } from "../services/api/ChatService";
import { ChatWebpageProvider } from "./ChatWebpageProvider";
import { Constants } from "../../constants";

export class ChatViewProvider
    implements vscode.WebviewViewProvider, vscode.Disposable
{
    public static readonly viewID = Constants.EXTENSION_ID + ".chatWebview";
    private view?: vscode.WebviewView;
    private messageHandlerDisposable?: vscode.Disposable;

    constructor(
        private readonly extensionUri: vscode.Uri,
        private readonly chatService: ChatService
    ) {}

    // called when chat panel is opened
    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this.view = webviewView;
        this.setupWebview();
        this.chatService.setWebview(webviewView);
    }

    private setupWebview(): void {
        if (!this.view) {
            return;
        }
        const webview = this.view.webview;
        webview.options = {
            enableScripts: true, // enable JS
            localResourceRoots: [this.extensionUri], // needed to load local resources
        };

        webview.html = this.getHtmlContent();
        this.setupMessageHandling(webview);
    }

    private setupMessageHandling(webview: vscode.Webview) {
        this.messageHandlerDisposable?.dispose(); // dispose previous listener if any
        this.messageHandlerDisposable = webview.onDidReceiveMessage(
            async (data) => {
                await this.chatService.handleWebviewMessage(data);
            }
        );
    }

    private getHtmlContent(): string {
        if (!this.view) {
            return "";
        }

        return new ChatWebpageProvider(this.extensionUri).getHtmlContent(
            this.view.webview
        );
    }

    public dispose(): void {
        this.messageHandlerDisposable?.dispose();
        this.view = undefined;
    }
}
