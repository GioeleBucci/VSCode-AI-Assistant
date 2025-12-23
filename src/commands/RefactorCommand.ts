import { BaseEditorTransformer } from "./api/BaseEditorTransformer";

export class RefactorCommand extends BaseEditorTransformer {
    private readonly id = "refactor";
    private readonly systemInstructions =
        "You are a code refactoring assistant. The user will provide code to refactor. Refactor the code to make it cleaner and more readable. If the code is already clean, return the original code. Return the refactored code ONLY, without any additional explanations.";

    public async applyTransformation(): Promise<void> {
        await this.aiCodeProcess(
            this.systemInstructions,
            undefined, // no user prompt needed
            "Refactoring...",
            "Code Refactored!"
        );
    }

    public getId(): string {
        return this.id;
    }
}
