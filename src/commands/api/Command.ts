/**
 * Abstraction for a generic extension Command
 */
export interface Command {
    /**
     * Determines whether the command can currently be executed.
     */
    canExecute(): boolean;

    /**
     * Executes the command.
     */
    execute(...args: any[]): Promise<void>;

    /**
     * Get the command unique identifier for registration within VS Code.
     */
    getId(): string;
}
