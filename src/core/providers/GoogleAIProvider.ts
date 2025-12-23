import { GoogleGenAI, Content, GenerateContentResponse } from "@google/genai";
import { ConversationElement } from "../../core/services/api/AIService";
import { AgentConfig } from "../../core/agents/api/AIAgent";
import { GoogleAIAgent } from "../../core/agents/GoogleAIAgent";
import { AbstractAIProvider } from "../../core/providers/api/AbstractAIProvider";

export class GoogleAIProvider extends AbstractAIProvider<GoogleAIAgent> {
    private ai?: GoogleGenAI;

    constructor(apiKey: string) {
        super(apiKey);
        this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }

    public createAgentFromConfig(config: AgentConfig): GoogleAIAgent {
        return new GoogleAIAgent(config);
    }

    public async generateContent(
        agent: GoogleAIAgent,
        content: string,
        history?: ConversationElement[],
        instructions?: string
    ): Promise<string> {
        if (!this.ai) {
            throw new Error("Google AI provider not initialized");
        }

        // convert provider-agnostic history to Google AI format
        const contents: Content[] = this.convertHistory(history);

        // add the current user message
        contents.push({
            role: "user",
            parts: [{ text: content }],
        });

        const googleAgent = agent;
        const response = await this.ai.models.generateContent({
            model: agent.model,
            contents: contents,
            config: googleAgent.getConfigWithInstructions(instructions),
        });

        let responseText = response.text || "";
        return this.isSearchGroundingEnabled(agent)
            ? this.appendGroundingMetadata(responseText, response)
            : responseText;
    }

    public toggleSearchGrounding(agent: GoogleAIAgent): boolean {
        agent.isGroundingEnabled = !agent.isGroundingEnabled;
        return true;
    }

    public isSearchGroundingEnabled(agent: GoogleAIAgent): boolean {
        return agent.isGroundingEnabled;
    }

    private convertHistory(history?: ConversationElement[]): Content[] {
        const contents: Content[] = [];

        if (history && history.length > 0) {
            for (const msg of history) {
                contents.push({
                    role: msg.role === "assistant" ? "model" : msg.role,
                    parts: [{ text: msg.content }],
                });
            }
        }

        return contents;
    }

    private appendGroundingMetadata(
        responseText: string,
        response: GenerateContentResponse
    ): string {
        const groundingContent =
            response.candidates?.[0]?.groundingMetadata?.searchEntryPoint
                ?.renderedContent;

        if (!groundingContent) {
            return responseText;
        }

        return `${responseText}\n\n---\n\n**Search Results Used:**\n\n${groundingContent}`;
    }
}
