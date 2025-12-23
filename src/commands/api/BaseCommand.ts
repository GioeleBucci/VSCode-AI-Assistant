import { ServiceContainer } from "../../core/services/api/ServiceContainer";
import { Command } from "./Command";

export abstract class BaseCommand implements Command {
    constructor(protected readonly serviceContainer: ServiceContainer) {}

    public abstract execute(...args: any[]): Promise<void>;
    public abstract canExecute(): boolean;
    public abstract getId(): string;
}
