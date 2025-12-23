import { ServiceContainer } from "../services/api/ServiceContainer";
import { ConfigServiceImpl } from "../services/ConfigServiceImpl";
import { FileServiceImpl } from "../services/FileServiceImpl";
import { ChatServiceImpl } from "../services/ChatServiceImpl";
import { AIServiceImpl } from "../services/AIServiceImpl";
import { RateLimitServiceImpl } from "../services/RateLimitServiceImpl";
import { LoggingServiceImpl } from "../services/LoggingServiceImpl";

/** Helper class to register the main services */
export class ServiceRegistration {
    public static configureServices(container: ServiceContainer): void {
        // core services
        container.register("ConfigService", () => new ConfigServiceImpl());
        container.register("LoggingService", () => new LoggingServiceImpl());
        container.register(
            "RateLimitService",
            (container) =>
                new RateLimitServiceImpl(container.resolve("LoggingService"))
        );

        container.register(
            "AIService",
            (container) =>
                new AIServiceImpl(
                    container.resolve("ConfigService"),
                    container.resolve("LoggingService")
                )
        );

        container.register(
            "FileService",
            () => new FileServiceImpl(container.resolve("LoggingService"))
        );

        // chatService needs AI Agent, which requires configuration
        container.register("ChatService", (container) => {
            const configService = container.resolve("ConfigService");
            const aiService = container.resolve("AIService");
            const config = configService.getConfig();
            const aiAgent = aiService.createAgent(config.chatModel);

            return new ChatServiceImpl(
                aiService,
                aiAgent,
                container.resolve("FileService"),
                container.resolve("LoggingService")
            );
        });
    }
}
