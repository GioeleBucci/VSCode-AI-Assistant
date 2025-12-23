import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { FileService } from "./api/FileService";
import { LoggingService } from "./api/LoggingService";
import { Constants } from "../../constants";

export class FileServiceImpl implements FileService {
    private readonly rootPath =
        vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || "";

    constructor(private readonly logger?: LoggingService) {}

    public getUserDefinedInstructions(): string | undefined {
        if (!this.rootPath) {
            return undefined;
        }

        const instructionsPath = path.join(
            this.rootPath,
            Constants.INSTRUCTION_FILE_DIRECTORY,
            Constants.INSTRUCTION_FILE_NAME
        );

        return this.getFileContent(instructionsPath);
    }

    public hasActiveTextEditor(): boolean {
        return this.getActiveEditor() !== undefined;
    }

    public getEditorSelection(): string | undefined {
        return this.getTextFromActiveEditor(true);
    }

    public getEditorContent(): string | undefined {
        return this.getTextFromActiveEditor(false);
    }

    public async replaceSelectedText(newText: string): Promise<boolean> {
        const editor = this.getActiveEditor();
        if (!editor) {
            return false;
        }

        return editor.edit((editBuilder) => {
            editBuilder.replace(editor.selection, newText);
        });
    }

    public async replaceFileContent(newText: string): Promise<boolean> {
        const editor = this.getActiveEditor();
        if (!editor) {
            return false;
        }

        const fullRange = this.getFullDocumentRange(editor.document);
        return editor.edit((editBuilder) => {
            editBuilder.replace(fullRange, newText);
        });
    }

    public getFileContent(filePath: string): string | undefined {
        // first check if file is open in active editor (gets unsaved changes)
        const activeEditor = this.getActiveEditor();
        if (activeEditor && activeEditor.document.uri.fsPath === filePath) {
            return activeEditor.document.getText();
        }
        // otherwise read from disk
        try {
            return fs.readFileSync(filePath, "utf8");
        } catch (error) {
            this.logger?.error(
                `Failed to read file: ${filePath}`,
                error as Error
            );
            return undefined;
        }
    }

    public getFileName(filePath: string): string {
        return path.basename(filePath);
    }

    public getFileExtension(filePath: string): string {
        const ext = path.extname(filePath);
        return ext ? ext.slice(1) : "";
    }

    private getActiveEditor(): vscode.TextEditor | undefined {
        return vscode.window.activeTextEditor;
    }

    private getTextFromActiveEditor(
        selectionOnly: boolean
    ): string | undefined {
        const editor = this.getActiveEditor();
        if (!editor) {
            return undefined;
        }
        return editor.document
            .getText(selectionOnly ? editor.selection : undefined)
            .trim();
    }

    private getFullDocumentRange(document: vscode.TextDocument): vscode.Range {
        return new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
        );
    }
}
