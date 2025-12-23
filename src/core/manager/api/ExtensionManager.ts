/** Extension entry point */
export interface ExtensionManager {
    /**
     * Gets called by VS Code when the extension is activated.
     */
    activate(): void;
    /**
     * Gets called by VS Code when the extension is deactivated.
     */
    deactivate(): void;
}
