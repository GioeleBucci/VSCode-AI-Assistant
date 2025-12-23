import { GenerateContentConfig } from "@google/genai";
import { AgentConfig } from "./api/AIAgent";
import { AbstractAIAgent } from "./api/AbstractAIAgent";

export class GoogleAIAgent extends AbstractAIAgent {
    private _isGroundingEnabled = false;

    constructor(config: AgentConfig) {
        super(config);
    }

    public get isGroundingEnabled(): boolean {
        return this._isGroundingEnabled;
    }

    public set isGroundingEnabled(value: boolean) {
        this._isGroundingEnabled = value;
    }

    public getConfig(): GenerateContentConfig {
        return this.getConfigWithInstructions(undefined);
    }

    public getConfigWithInstructions(instructions?: string): GenerateContentConfig {
        return {
            temperature: this.temperature,
            maxOutputTokens: this.maxOutputTokens,
            topK: this.topK,
            topP: this.topP,
            systemInstruction: instructions,
            tools: this._isGroundingEnabled ? [{ googleSearch: {} }] : undefined,
        };
    }
}
