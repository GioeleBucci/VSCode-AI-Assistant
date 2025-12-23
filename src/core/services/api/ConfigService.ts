import { ExtensionConfiguration } from "./ExtensionConfiguration";
import { Service } from "./Service";

export interface ConfigService extends Service {
    /**
     * Validates that all required configuration settings are present and valid.
     * Shows error messages to the user if required settings are missing.
     * @returns true if all required settings are valid, false otherwise
     */
    isConfigValid(): boolean;

    /**
     * Retrieves the current extension configuration from VS Code settings.
     * @returns The complete configuration object with all settings
     */
    getConfig(): ExtensionConfiguration;
}
