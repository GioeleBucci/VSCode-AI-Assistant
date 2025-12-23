import { Service } from "./Service";

export interface RateLimitService extends Service {
    /**
     * Configure rate limiting for a certain feature 
     * @param key - Unique feature identifier
     * @param timeBetweenRequests - Minimum time between requests (in milliseconds)
     */
    configureRateLimit(
        key: string,
        timeBetweenRequests: number
    ): void;

    /**
     * Check if an API request is allowed based on rate limiting
     * @param key - Unique identifier for the feature
     * @returns true if request is allowed, false otherwise
     */
    isRequestAllowed(key: string): boolean;
}
