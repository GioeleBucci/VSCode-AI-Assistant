import * as vscode from "vscode";
import { ConfigService } from "./api/ConfigService";
import { Constants } from "../../constants";
import { ExtensionConfiguration } from "./api/ExtensionConfiguration";
import { ProviderID } from "./api/ProviderID";

export class ConfigServiceImpl implements ConfigService {
    public isConfigValid(): boolean {
        const config = this.getConfig();

        if (!config.provider) {
            vscode.window.showErrorMessage(
                `Agent provider is not defined in the configuration. Please set '${Constants.EXTENSION_ID}.provider' in your settings.`
            );
            return false;
        }

        if (!config.apiKey) {
            vscode.window.showErrorMessage(
                `API key is not defined in the configuration. Please set '${Constants.EXTENSION_ID}.apiKey' in your settings.`
            );
            return false;
        }

        if (!config.baseModel) {
            vscode.window.showErrorMessage(
                `Model is not defined in the configuration. Please set '${Constants.EXTENSION_ID}.baseModel' in your settings.`
            );
            return false;
        }

        return true;
    }

    public getConfig(): ExtensionConfiguration {
        const config = vscode.workspace.getConfiguration(
            Constants.EXTENSION_ID
        );
        const baseModelValue = config.get<string>("baseModel");

        return {
            // required settings: if isConfigValid() is true, these will always be defined.
            provider: config.get<ProviderID>("provider")!,
            apiKey: config.get<string>("apiKey")!,
            baseModel: baseModelValue!,
            // optional settings, undefined if not explicitly set by user
            chatModel:
                this.getConfigValue<string>("chatModel") ?? baseModelValue!,
            temperature: this.getConfigValue<number>("temperature"),
            maxOutputTokens: this.getConfigValue<number>("maxOutputTokens"),
            topK: this.getConfigValue<number>("topK"),
            topP: this.getConfigValue<number>("topP"),

            // Required settings with defaults - always return actual value
            enableInlineCompletions: config.get<boolean>(
                "enableInlineCompletions"
            )!,
            inlineCompletions: {
                model:
                    this.getConfigValue<string>("inlineCompletions.model") ??
                    baseModelValue!,
                timeBetweenRequests: config.get<number>(
                    "inlineCompletions.timeBetweenRequests"
                )!,
                idleDelay: config.get<number>("inlineCompletions.idleDelay")!,
            },
        };
    }

    // gets a configuration value but only if it has been explicitly set by the user.
    private getConfigValue<T>(key: string): T | undefined {
        const config = vscode.workspace.getConfiguration(
            Constants.EXTENSION_ID
        );
        const inspection = config.inspect(key);
        /* this is necessary because config.get() will return the default value
        of the data type if the property is not set, e.g. 0 for number, in that case
         we want to return undefined instead */
        const isSet =
            inspection?.globalValue !== undefined ||
            inspection?.workspaceValue !== undefined ||
            inspection?.workspaceFolderValue !== undefined;
        return isSet ? config.get<T>(key) : undefined;
    }
}
