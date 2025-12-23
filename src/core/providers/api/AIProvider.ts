import { AIContentGenerator } from "../../services/api/AIService";
import { AgentConfig, AIAgent } from "../../agents/api/AIAgent";

/** Interface for a specific agent provider  */
export interface AIProvider extends AIContentGenerator {
    // recieve fresh config for each agent creation
    createAgentFromConfig(config: AgentConfig): AIAgent;
}
