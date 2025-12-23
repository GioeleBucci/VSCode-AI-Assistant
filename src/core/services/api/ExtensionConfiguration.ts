import { ProviderID } from "./ProviderID";

export type ExtensionConfiguration = {
    provider: ProviderID;
    apiKey: string;
    baseModel: string;
    chatModel: string;
    temperature?: number;
    maxOutputTokens?: number;
    topK?: number;
    topP?: number;
    enableInlineCompletions: boolean;
    inlineCompletions: {
        model: string;
        timeBetweenRequests: number;
        idleDelay: number;
    };
}
