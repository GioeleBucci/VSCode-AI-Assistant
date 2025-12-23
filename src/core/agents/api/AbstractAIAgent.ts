import { AIAgent, AgentConfig } from "./AIAgent";

export abstract class AbstractAIAgent implements AIAgent {
    private readonly _model: string;
    private readonly _temperature: number | undefined;
    private readonly _topK: number | undefined;
    private readonly _maxOutputTokens: number | undefined;
    private readonly _topP: number | undefined;

    constructor(config: AgentConfig) {
        this._model = config.model;
        this._temperature = config.temperature;
        this._maxOutputTokens = config.maxOutputTokens;
        this._topK = config.topK;
        this._topP = config.topP;
    }

    get model(): string {
        return this._model;
    }

    get temperature(): number | undefined {
        return this._temperature;
    }

    get maxOutputTokens(): number | undefined {
        return this._maxOutputTokens;
    }

    get topK(): number | undefined {
        return this._topK;
    }

    get topP(): number | undefined {
        return this._topP;
    }
}
