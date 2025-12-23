import { ConversationElement } from "../../services/api/AIService";
import { AgentConfig, AIAgent } from "../../agents/api/AIAgent";
import { AIProvider } from "./AIProvider";

export abstract class AbstractAIProvider<T extends AIAgent>
    implements AIProvider
{
    constructor(protected readonly apiKey: string) {}

    abstract createAgentFromConfig(config: AgentConfig): T;
    abstract generateContent(
        agent: T,
        content: string,
        history?: ConversationElement[],
        instructions?: string
    ): Promise<string>;
    abstract toggleSearchGrounding(agent: T): boolean;
    abstract isSearchGroundingEnabled(agent: T): boolean;
}
