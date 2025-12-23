import * as vscode from "vscode";
import { BaseEditorTransformer } from "./api/BaseEditorTransformer";

export class EditCommand extends BaseEditorTransformer {
    private readonly id = "edit";
    private readonly userInstructions =
        "Describe what edits you want to make. Select some text to edit a specific section only, or leave unselected to edit the entire file.";
    private readonly systemInstructions =
        "You are a code editing assistant. The user will provide code and a description of the edits they want. Apply the requested edits to the code. Return the edited code ONLY, without any additional explanations.";

    public async applyTransformation(): Promise<void> {
        // show input box to get user prompt
        const userPrompt = await vscode.window.showInputBox({
            placeHolder: "Enter your prompt...",
            prompt: this.userInstructions,
            ignoreFocusOut: true,
        });
        if (!userPrompt) {
            return; // user cancelled
        }

        await this.aiCodeProcess(
            this.systemInstructions,
            userPrompt,
            "Editing...",
            "Code Edited!"
        );
    }

    public getId(): string {
        return this.id;
    }
}
