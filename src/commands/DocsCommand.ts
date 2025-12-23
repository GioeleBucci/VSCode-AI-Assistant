import { BaseEditorTransformer } from "./api/BaseEditorTransformer";

export class DocsCommand extends BaseEditorTransformer {
    private readonly id = "docs";
    private readonly systemInstructions =
        "You are a code documentation assistant. Your task is to add documentation to the code provided by the user. Document all public functions and any non-trivial internal function. Use the idiomatic documentation format for the language. Return the code with the added comments ONLY, without any additional explanations.";

    public async applyTransformation(): Promise<void> {
        await this.aiCodeProcess(
            this.systemInstructions,
            undefined, // no user prompt needed
            "Generating documentation...",
            "Documentation Generated!"
        );
    }

    public getId(): string {
        return this.id;
    }
}
