import { ServiceRegistry } from "./ServiceRegistry";

export interface ServiceContainer {
    register<K extends keyof ServiceRegistry>( // keyof used for type safety for keys
        key: K,
        factory: (container: ServiceContainer) => ServiceRegistry[K]
    ): void;
    resolve<K extends keyof ServiceRegistry>(key: K): ServiceRegistry[K];
}
