import * as vscode from "vscode";
import { LoggingService } from "./api/LoggingService";

export class LoggingServiceImpl implements LoggingService, vscode.Disposable {
    private outputChannel: vscode.LogOutputChannel;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel("AI Assistant", {
            log: true,
        });
    }

    public debug(message: string, ...args: any[]): void {
        this.outputChannel.debug(message, ...args);
    }

    public info(message: string, ...args: any[]): void {
        this.outputChannel.info(message, ...args);
    }

    public warn(message: string, ...args: any[]): void {
        this.outputChannel.warn(message, ...args);
    }

    public error(message: string, error?: Error, ...args: any[]): void {
        if (error) {
            this.outputChannel.error(message, error, ...args);
        } else {
            this.outputChannel.error(message, ...args);
        }
    }

    public dispose(): void {
        this.outputChannel.dispose();
    }
}
