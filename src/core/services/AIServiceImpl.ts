import { ConversationElement, AIService } from "./api/AIService";
import { AIAgent } from "../agents/api/AIAgent";
import { AIProvider } from "../providers/api/AIProvider";
import { LoggingService } from "./api/LoggingService";
import { ConfigService } from "./api/ConfigService";
import { GoogleAIProvider } from "../providers/GoogleAIProvider";
import { ProviderID } from "./api/ProviderID";

export class AIServiceImpl implements AIService {
    private readonly provider: AIProvider;

    constructor(
        private readonly configService: ConfigService,
        private readonly loggingService?: LoggingService
    ) {
        const id: ProviderID = configService.getConfig().provider;
        const apiKey = configService.getConfig().apiKey;
        switch (id) {
            case ProviderID.GOOGLE:
                this.provider = new GoogleAIProvider(apiKey);
                break;
            default:
                loggingService?.error(`Unsupported AI provider: ${id}`);
                throw new Error(`Unsupported AI provider: ${id}`);
        }
    }

    public createAgent(model: string): AIAgent {
        const config = this.configService.getConfig(); // Get fresh config

        return this.provider.createAgentFromConfig({
            model,
            temperature: config.temperature,
            maxOutputTokens: config.maxOutputTokens,
            topK: config.topK,
            topP: config.topP,
        });
    }

    public async generateContent(
        agent: AIAgent,
        content: string,
        history?: ConversationElement[],
        instructions?: string
    ): Promise<string> {
        this.loggingService?.debug("AIService: generateContent called", {
            contentLength: content.length,
            historyLength: history?.length || 0,
            hasInstructions: !!instructions,
        });

        try {
            const result = await this.provider.generateContent(
                agent,
                content,
                history,
                instructions
            );
            this.loggingService?.debug("AIService: generateContent result", {
                resultLength: result.length,
            });
            return result;
        } catch (error) {
            this.loggingService?.error(
                "AI content generation failed",
                error as Error
            );
            throw error;
        }
    }

    public toggleSearchGrounding(agent: AIAgent): boolean {
        return this.provider.toggleSearchGrounding(agent);
    }

    public isSearchGroundingEnabled(agent: AIAgent): boolean {
        return this.provider.isSearchGroundingEnabled(agent);
    }
}
