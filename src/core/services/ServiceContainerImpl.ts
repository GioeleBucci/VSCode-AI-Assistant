import { ServiceRegistry } from "./api/ServiceRegistry";
import { Service } from "./api/Service";
import { ServiceContainer } from "./api/ServiceContainer";

// internal class to manage service instantiation
class ServiceDescriptor<T extends Service = Service> {
    private instance?: T;

    constructor(
        private readonly provider: (container: ServiceContainer) => T,
        private readonly container: ServiceContainer
    ) {}

    public getInstance(): T {
        if (!this.instance) {
            this.instance = this.provider(this.container);
        }
        return this.instance;
    }
}

export class ServiceContainerImpl implements ServiceContainer {
    private services = new Map<string, ServiceDescriptor>();

    public register<K extends keyof ServiceRegistry>(
        key: K,
        provider: (container: ServiceContainer) => ServiceRegistry[K]
    ): void {
        this.services.set(key as string, new ServiceDescriptor(provider, this));
    }

    public resolve<K extends keyof ServiceRegistry>(
        key: K
    ): ServiceRegistry[K] {
        const descriptor = this.services.get(
            key as string
        ) as ServiceDescriptor<ServiceRegistry[K]>;
        if (!descriptor) {
            throw new Error(`Service ${String(key)} not registered`);
        }

        return descriptor.getInstance();
    }
}
