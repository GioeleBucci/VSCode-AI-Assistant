import * as vscode from "vscode";
import { Range } from "vscode";
import { AIService } from "../core/services/api/AIService";
import { Utils } from "../utils";
import { RateLimitService } from "../core/services/api/RateLimitService";
import { LoggingService } from "../core/services/api/LoggingService";
import { ServiceContainer } from "../core/services/api/ServiceContainer";
import { ExtensionConfiguration } from "../core/services/api/ExtensionConfiguration";

const SERVICE_KEY = "inline-completion";
const MIN_CONTEXT_LENGTH = 10;

export class InlineCompletionProvider
    implements vscode.InlineCompletionItemProvider
{
    private readonly aiService: AIService;
    private readonly rateLimitService: RateLimitService;
    private readonly logger: LoggingService;
    private idleTimer: NodeJS.Timeout | undefined;

    constructor(
        container: ServiceContainer,
        private readonly config: ExtensionConfiguration["inlineCompletions"]
    ) {
        this.aiService = container.resolve("AIService");
        this.rateLimitService = container.resolve("RateLimitService");
        this.logger = container.resolve("LoggingService");
    }

    /**
     * Registers this inline completion provider with VSCode.
     * @returns A disposable to unregister this provider.
     */
    public register(): vscode.Disposable {
        this.logger.debug(
            "Registering inline completion provider with config",
            {
                config: this.config,
            }
        );
        this.rateLimitService.configureRateLimit(
            SERVICE_KEY,
            this.config.timeBetweenRequests
        );

        const providerRegistration =
            vscode.languages.registerInlineCompletionItemProvider(
                { pattern: "**" },
                this
            );

        return new vscode.Disposable(() => {
            providerRegistration.dispose();
        });
    }

    public provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<
        vscode.InlineCompletionItem[] | vscode.InlineCompletionList
    > {
        if (context.triggerKind === vscode.InlineCompletionTriggerKind.Invoke) {
            this.logger.debug("Manual trigger for inline completion.");
            return this.getCompletions(document, position, token);
        }

        this.resetIdleTimer();
        return new Promise((resolve) => {
            this.idleTimer = setTimeout(async () => {
                if (token.isCancellationRequested) {
                    resolve([]);
                    return;
                }

                const result = await this.getCompletions(
                    document,
                    position,
                    token
                );
                resolve(result);
            }, this.config.idleDelay);
        });
    }

    private resetIdleTimer() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = undefined;
        }
    }

    private async getCompletions(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionItem[]> {
        if (token.isCancellationRequested) {
            this.logger.debug("Request cancelled.");
            return [];
        }

        if (!this.rateLimitService.isRequestAllowed(SERVICE_KEY)) {
            return [];
        }

        const lines = document
            .getText(new Range(new vscode.Position(0, 0), position))
            .split("\n");
        const prefix = lines.join("\n");
        const suffix = document.getText(
            new Range(
                position,
                document.lineAt(document.lineCount - 1).range.end
            )
        );

        if (prefix.trim().length < MIN_CONTEXT_LENGTH) {
            this.logger.info("Not enough context for completion");
            return [];
        }

        const suggestInstructions = this.createCompletionPrompt(
            document.languageId,
            prefix,
            suffix
        );

        try {
            const response = await this.aiService.generateContent(
                this.aiService.createAgent(this.config.model),
                "",
                undefined,
                suggestInstructions
            );

            if (response) {
                const suggestion =
                    Utils.removeCodeBlockMarkers(response).trim();

                return [
                    {
                        insertText: suggestion,
                        range: new Range(
                            position.line,
                            position.character,
                            position.line,
                            position.character
                        ),
                    },
                ];
            }
        } catch (error) {
            this.logger.error(
                "Error generating inline completion",
                error as Error
            );
            vscode.window.showErrorMessage(Utils.formatErrorMessage(error));
        }

        return [];
    }

    private createCompletionPrompt(
        fileLanguage: string,
        prefix: string,
        suffix: string
    ) {
        return [
            `You are given a ${fileLanguage} file, and your job is to suggest code completion to put exactly at the current cursor position.`,
            `Return ONLY the code to insert at the cursor, without any additional text or Markdown formatting.`,
            `If the code is already complete or there isn't enough context, return nothing.\n`,
            `The code before the cursor is:\n${prefix}`,
            `${
                suffix.trim().length === 0
                    ? "There is no code after the cursor"
                    : `The code after the cursor is:\n${suffix}`
            }`,
        ].join("\n");
    }
}
