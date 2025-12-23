import { AIAgent } from "../../agents/api/AIAgent";
import { Service } from "./Service";

/** Provider-agnostic conversation history interface */
export type ConversationElement = {
    role: "user" | "assistant" | "system";
    content: string;
};

/**
 * Interface for AI content generation services.
 */
export interface AIContentGenerator {
    /**
     * Generates content using the specified AI agent.
     * @param agent - The AI agent to use for content generation
     * @param content - The input content or prompt for generation
     * @param history - Optional conversation history for context
     * @param instructions - Optional additional instructions for the AI agent
     * @returns A promise that resolves to the generated content string
     */
    generateContent(
        agent: AIAgent,
        content: string,
        history?: ConversationElement[],
        instructions?: string
    ): Promise<string>;

    /**
     * Toggles search grounding feature for the specified AI agent.
     * @param agent - The AI agent to toggle search grounding for
     * @returns True if the feature was successfully toggled, false if not supported by the provider
     */
    toggleSearchGrounding(agent: AIAgent): boolean;

    /**
     * Checks if search grounding is currently enabled for the specified AI agent.
     * @param agent - The AI agent to check search grounding status for
     * @returns True if search grounding is enabled, false otherwise
     */
    isSearchGroundingEnabled(agent: AIAgent): boolean;
}

/** Wraps a specific provider and its functions */
export interface AIService extends Service, AIContentGenerator {
    // pass the model because the user may want to use different models in different contexts
    // (see baseModel and chatModel in config)
    createAgent(model: string): AIAgent;
}
