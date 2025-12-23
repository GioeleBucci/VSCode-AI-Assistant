import * as vscode from "vscode";
import { BaseCommand } from "./BaseCommand";
import { AIService } from "../../core/services/api/AIService";
import { ConfigService } from "../../core/services/api/ConfigService";
import { FileService } from "../../core/services/api/FileService";
import { LoggingService } from "../../core/services/api/LoggingService";
import { Utils } from "../../utils";
import { EditorTransformer } from "./EditorTransformer";

export abstract class BaseEditorTransformer
    extends BaseCommand
    implements EditorTransformer
{
    public canExecute(): boolean {
        return this.serviceContainer
            .resolve("FileService")
            .hasActiveTextEditor();
    }

    public async execute(): Promise<void> {
        if (!this.canExecute()) {
            return;
        }
        await this.applyTransformation();
    }

    public abstract applyTransformation(): Promise<void>;

    /**
     * AI-based code processing logic for in-place editor transformations.
     *
     * @param systemInstructions Instructions for the AI, provided by the specific command.
     * @param userPrompt Optional user prompt for the AI.
     * @param progressText Text to display during processing.
     * @param successMessage Message to display upon successful completion.
     */
    protected async aiCodeProcess(
        systemInstructions: string,
        userPrompt: string | undefined,
        progressText: string,
        successMessage: string
    ): Promise<void> {
        const aiService: AIService = this.serviceContainer.resolve("AIService");
        const configService: ConfigService =
            this.serviceContainer.resolve("ConfigService");
        const logger: LoggingService =
            this.serviceContainer.resolve("LoggingService");
        const fileService: FileService =
            this.serviceContainer.resolve("FileService");

        const selectedCode = fileService.getEditorSelection();
        const codeToTransform = selectedCode || fileService.getEditorContent()!;
        const isFullFile = !selectedCode;

        try {
            const agent = aiService.createAgent(
                configService.getConfig().baseModel
            );

            const processedCode = await vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: progressText,
                    cancellable: false,
                },
                async () => {
                    const transformedCode = await aiService.generateContent(
                        agent,
                        this.buildUserPrompt(codeToTransform, userPrompt),
                        undefined, // no conversation history
                        this.buildSystemInstructions(
                            fileService,
                            systemInstructions
                        )
                    );
                    return Utils.removeCodeBlockMarkers(transformedCode);
                }
            );

            await this.updateEditorContent(
                fileService,
                isFullFile,
                processedCode
            );
            // ask user to keep or undo the changes
            await this.handleUserConfirmation(successMessage);
        } catch (error) {
            logger.error(`${progressText} failed`, error as Error);
            vscode.window.showErrorMessage(Utils.formatErrorMessage(error));
        }
    }

    private buildUserPrompt(code: string, userPrompt?: string): string {
        return userPrompt
            ? `User request: ${userPrompt}\n\nCode:\n${code}`
            : code;
    }

    private buildSystemInstructions(
        fileService: FileService,
        systemInstructions: string
    ) {
        const userInstructions = fileService.getUserDefinedInstructions();
        if (userInstructions) {
            systemInstructions += `\n\nAdditional user instructions:\n${userInstructions}`;
        }
        return systemInstructions;
    }

    private async updateEditorContent(
        fileService: FileService,
        isFullFile: boolean,
        processedCode: string
    ) {
        if (isFullFile) {
            await fileService.replaceFileContent(processedCode);
        } else {
            await fileService.replaceSelectedText(processedCode);
        }
    }

    private async handleUserConfirmation(successMessage: string) {
        const result = await vscode.window.showInformationMessage(
            successMessage,
            "Keep Changes",
            "Undo"
        );
        if (result === "Undo") {
            await vscode.commands.executeCommand("undo");
        }
    }
}
