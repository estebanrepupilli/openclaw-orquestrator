import Docker from 'dockerode';
class DockerService {
    docker;
    constructor() {
        // Connect to the secure proxy as specified in requirements
        this.docker = new Docker({
            host: process.env.DOCKER_HOST_NAME || 'socket-proxy',
            port: Number(process.env.DOCKER_HOST_PORT) || 2375,
            protocol: 'http'
        });
    }
    async createInstance(params) {
        const { instanceId, subdomain, domain } = params;
        const containerOptions = {
            Image: 'openclaw/openclaw:latest',
            name: `openclaw-${instanceId}`,
            HostConfig: {
                RestartPolicy: { Name: 'always' },
                Binds: [`openclaw_data_${instanceId}:/app/data`],
                NetworkMode: 'orchestrator_net',
            },
            Labels: {
                'traefik.enable': 'true',
                [`traefik.http.routers.claw-${instanceId}.rule`]: `Host(\`${subdomain}.${domain}\`)`,
                [`traefik.http.routers.claw-${instanceId}.entrypoints`]: 'websecure',
                [`traefik.http.routers.claw-${instanceId}.tls.certresolver`]: 'myresolver',
                [`traefik.http.services.claw-${instanceId}.loadbalancer.server.port`]: '8080',
            },
            Env: [
                `INSTANCE_ID=${instanceId}`,
                `SUBDOMAIN=${subdomain}`,
            ]
        };
        const container = await this.docker.createContainer(containerOptions);
        return container;
    }
    async startInstance(containerId) {
        const container = this.docker.getContainer(containerId);
        await container.start();
    }
    async stopInstance(containerId) {
        const container = this.docker.getContainer(containerId);
        await container.stop();
    }
    async removeInstance(containerId, removeVolume = false) {
        const container = this.docker.getContainer(containerId);
        await container.remove({ force: true });
    }
    async getContainerStatus(containerId) {
        try {
            const container = this.docker.getContainer(containerId);
            const data = await container.inspect();
            return data.State.Status;
        }
        catch (error) {
            return 'UNKNOWN';
        }
    }
}
export const dockerService = new DockerService();
//# sourceMappingURL=docker.service.js.map