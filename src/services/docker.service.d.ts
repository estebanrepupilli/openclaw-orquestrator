import Docker from 'dockerode';
declare class DockerService {
    private docker;
    constructor();
    createInstance(params: {
        instanceId: string;
        subdomain: string;
        domain: string;
    }): Promise<Docker.Container>;
    startInstance(containerId: string): Promise<void>;
    stopInstance(containerId: string): Promise<void>;
    removeInstance(containerId: string, removeVolume?: boolean): Promise<void>;
    getContainerStatus(containerId: string): Promise<string>;
}
export declare const dockerService: DockerService;
export {};
//# sourceMappingURL=docker.service.d.ts.map