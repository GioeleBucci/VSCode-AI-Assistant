export interface AgentConfig {
    model: string;
    temperature?: number;
    maxOutputTokens?: number;
    topK?: number;
    topP?: number;
}

// Generic AI Agent tag interface
export interface AIAgent {}
