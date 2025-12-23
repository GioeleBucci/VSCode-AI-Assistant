import { AIService } from "./AIService";
import { FileService } from "./FileService";
import { LoggingService } from "./LoggingService";
import { RateLimitService } from "./RateLimitService";
import { ChatService } from "./ChatService";
import { ConfigService } from "./ConfigService";

export interface ServiceRegistry {
    "ConfigService": ConfigService;
    "LoggingService": LoggingService;
    "AIService": AIService;
    "ChatService": ChatService;
    "RateLimitService": RateLimitService;
    "FileService": FileService;
}
