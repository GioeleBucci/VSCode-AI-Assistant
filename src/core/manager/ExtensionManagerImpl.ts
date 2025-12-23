import * as vscode from "vscode";
import { ServiceContainerImpl } from "../services/ServiceContainerImpl";
import { ServiceRegistration } from "./ServiceRegistration";
import { ServiceContainer } from "../services/api/ServiceContainer";
import { RefactorCommand } from "../../commands/RefactorCommand";
import { EditCommand } from "../../commands/EditCommand";
import { NewChatCommand } from "../../commands/NewChatCommand";
import { ChatWebviewManager } from "../webview/ChatWebviewManager";
import { InlineCompletionProvider } from "../../completions/InlineCompletionProvider";
import { ExtensionManager } from "./api/ExtensionManager";
import { WebviewManager } from "../webview/api/WebviewManager";
import { Constants } from "../../constants";
import { DocsCommand } from "../../commands/DocsCommand";

export class ExtensionManagerImpl implements ExtensionManager {
    private serviceContainer: ServiceContainer;
    private webViewManager: WebviewManager;
    private inlineCompletionProvider?: InlineCompletionProvider;

    constructor(private readonly context: vscode.ExtensionContext) {
        this.serviceContainer = new ServiceContainerImpl();
        ServiceRegistration.configureServices(this.serviceContainer);

        this.webViewManager = new ChatWebviewManager(
            this.serviceContainer,
            this.context.extensionUri
        );
    }

    public activate(): void {
        const configService = this.serviceContainer.resolve("ConfigService");
        const logger = this.serviceContainer.resolve("LoggingService");

        // validate required configuration
        if (!configService.isConfigValid()) {
            logger.error(
                "Required properties are missing. The extension will not function properly."
            );
            return;
        }

        const config = configService.getConfig();

        // register commands
        this.registerCommands();

        // activate webview
        this.webViewManager.activate(this.context);

        // activate inline completions if enabled
        if (config.enableInlineCompletions) {
            this.inlineCompletionProvider = new InlineCompletionProvider(
                this.serviceContainer,
                config.inlineCompletions
            );
            const inlineCompletionDisposable =
                this.inlineCompletionProvider.register();
            this.context.subscriptions.push(inlineCompletionDisposable);
        } else {
            logger.info("Skipping inline completion provider activation");
        }

        logger.info("Extension activated successfully");
    }

    public deactivate(): void {}

    private registerCommands(): void {
        const commands = [
            new RefactorCommand(this.serviceContainer),
            new EditCommand(this.serviceContainer),
            new DocsCommand(this.serviceContainer),
            new NewChatCommand(this.serviceContainer),
        ];

        commands.forEach((command) => {
            const disposable = vscode.commands.registerCommand(
                `${Constants.EXTENSION_ID}.${command.getId()}`,
                async () => {
                    if (command.canExecute()) {
                        await command.execute();
                    }
                }
            );
            this.context.subscriptions.push(disposable);
        });
    }
}
