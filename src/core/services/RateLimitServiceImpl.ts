import { LoggingService } from "./api/LoggingService";
import { RateLimitService } from "./api/RateLimitService";

type RateLimitEntry = {
    timeoutMs: number;
    lastRequestTime: number;
};

export class RateLimitServiceImpl implements RateLimitService {
    private rateLimits = new Map<string, RateLimitEntry>();

    constructor(private readonly logger?: LoggingService) {}

    public configureRateLimit(key: string, timeBetweenRequests: number): void {
        this.logger?.info(`Configuring rate limit for ${key}`, {
            timeBetweenRequests,
        });
        this.rateLimits.set(key, {
            timeoutMs: timeBetweenRequests,
            lastRequestTime: 0,
        });
    }

    public isRequestAllowed(key: string): boolean {
        const entry = this.getEntryOrThrow(key);
        const now = Date.now();

        // check if enough time has passed since the last request
        const timeSinceLastRequest = now - entry.lastRequestTime;
        if (timeSinceLastRequest < entry.timeoutMs) {
            const waitTime = entry.timeoutMs - timeSinceLastRequest;
            this.logger?.warn(
                `Wait ${waitTime}ms before next request for '${key}'`
            );
            return false;
        }

        // allow request and update last request time
        entry.lastRequestTime = now;
        this.logger?.debug(`Request allowed for '${key}'`);
        return true;
    }

    private getEntryOrThrow(key: string): RateLimitEntry {
        const entry = this.rateLimits.get(key);
        if (!entry) {
            const err = `No configuration found for '${key}'`;
            this.logger?.error(err);
            throw new Error(err);
        }
        return entry;
    }
}
