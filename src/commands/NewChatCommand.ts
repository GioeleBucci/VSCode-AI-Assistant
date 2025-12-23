import { BaseCommand } from "./api/BaseCommand";

export class NewChatCommand extends BaseCommand {
    private readonly id = "newChat";

    public canExecute(): boolean {
        return true; // can always execute
    }

    public async execute(): Promise<void> {
        await this.serviceContainer.resolve("ChatService").clearChat();
    }

    public getId(): string {
        return this.id;
    }
}
