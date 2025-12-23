import * as vscode from "vscode";
import { AIService, ConversationElement } from "./api/AIService";
import { AIAgent } from "../agents/api/AIAgent";
import { LoggingService } from "./api/LoggingService";
import { ChatContextManager } from "../webview/api/ChatContextManager";
import { FileService } from "./api/FileService";
import { ChatService } from "./api/ChatService";
import { Utils } from "../../utils";
import { ChatContextManagerImpl } from "../webview/ChatContextManagerImpl";

export class ChatServiceImpl implements ChatService {
    private view?: vscode.WebviewView;
    private contextManager: ChatContextManager;

    constructor(
        private readonly aiService: AIService,
        private readonly aiAgent: AIAgent,
        private readonly fileService: FileService,
        private readonly logger?: LoggingService
    ) {
        this.contextManager = new ChatContextManagerImpl(
            this.fileService,
            this.logger
        );
    }

    public setWebview(webview: vscode.WebviewView): void {
        this.view = webview;
        this.contextManager.setWebview(webview);
    }

    public async handleWebviewMessage(data: any): Promise<void> {
        this.logger?.debug(
            `Received message type: ${data.type}`,
            data
        );

        switch (data.type) {
            case "userMessage":
                await this.handleUserMessage(
                    data.message,
                    data.conversationHistory || [],
                    data.contextFiles || []
                );
                break;
            case "requestFileSelection":
                await this.contextManager.handleFileSelection();
                break;
            case "requestCurrentFile":
                this.contextManager.sendCurrentFileToWebview();
                break;
            case "toggleGrounding":
                this.toggleGrounding();
                break;
            default:
                this.logger?.warn(`Unknown message type: ${data.type}`);
        }
    }

    public async clearChat(): Promise<void> {
        if (this.view) {
            await this.view.webview.postMessage({
                type: "clearChat",
            });
            this.logger?.info("Chat cleared");
        }
    }

    private toggleGrounding(): void {
        const toggleSuccessful = this.aiService.toggleSearchGrounding(
            this.aiAgent
        );

        if (toggleSuccessful && this.view) {
            const isEnabled = this.aiService.isSearchGroundingEnabled(
                this.aiAgent
            );
            this.view.webview.postMessage({
                type: "updateGroundingState",
                isEnabled: isEnabled,
            });
            this.logger?.info(`Grounding ${isEnabled ? "enabled" : "disabled"}`);
        } else if (!toggleSuccessful) {
            this.logger?.warn("Grounding not supported for current AI provider");
        }
    }

    private async handleUserMessage(
        message: string,
        conversationHistory: ConversationElement[],
        contextFiles: string[]
    ): Promise<void> {
        this.logger?.info(`Handling user message: "${message}"`);

        try {
            const fullMessage = this.contextManager.buildContextualMessage(
                message,
                contextFiles
            );

            this.logger?.debug(`Full message with context: "${fullMessage}"`);
            this.logger?.debug("Calling AI service for content generation...");

            const userInstructions =
                this.fileService.getUserDefinedInstructions();

            const response = await this.aiService.generateContent(
                this.aiAgent,
                fullMessage,
                conversationHistory,
                userInstructions
            );

            this.logger?.info("AI response received:", {
                responseLength: response.length,
                fullResponse: response,
            });

            if (this.view) {
                this.logger?.debug("Sending AI response to webview...");
                this.view.webview.postMessage({
                    type: "assistantMessage",
                    message: response,
                });
            }
        } catch (error) {
            this.logger?.error("Error processing user message", error as Error);

            if (this.view) {
                this.view.webview.postMessage({
                    type: "assistantMessage",
                    message: Utils.formatErrorMessage(error, true),
                });
            }
        }
    }
}
