import { DockerContainer, DockerImage } from '../types';

// Default APIs as provided in the original code
export const DEFAULT_APIS = ['http://localhost:5000', 'http://10.2.1.235:5000', 'http://0.0.0.0:5000'];

// Initial mock dataset for simulation when real endpoints are unreachable
const INITIAL_CONTAINERS: DockerContainer[] = [
  {
    container_id: 'a1b2c3d4e5f67890abcdef12',
    name: 'web-frontend-nginx',
    image: 'nginx:1.25-alpine',
    status: 'Up 3 hours (healthy)',
    created: '3 hours ago',
    ports: '80:80/tcp, 443:443/tcp',
    cpu: 1.4,
    memory: '38.2 MB / 2 GB',
    ipAddress: '172.18.0.2',
  },
  {
    container_id: 'b2c3d4e5f6a17890abcdef34',
    name: 'api-service-node',
    image: 'node:20-alpine',
    status: 'Up 2 hours',
    created: '2 hours ago',
    ports: '3000:3000/tcp',
    cpu: 3.8,
    memory: '142.5 MB / 4 GB',
    ipAddress: '172.18.0.3',
  },
  {
    container_id: 'c3d4e5f6a1b27890abcdef56',
    name: 'cache-redis-cluster',
    image: 'redis:7.2-alpine',
    status: 'Up 5 hours',
    created: '5 hours ago',
    ports: '6379:6379/tcp',
    cpu: 0.8,
    memory: '24.1 MB / 1 GB',
    ipAddress: '172.18.0.4',
  },
  {
    container_id: 'd4e5f6a1b2c37890abcdef78',
    name: 'db-postgres-primary',
    image: 'postgres:16.2',
    status: 'Up 6 hours (healthy)',
    created: '6 hours ago',
    ports: '5432:5432/tcp',
    cpu: 2.1,
    memory: '215.8 MB / 4 GB',
    ipAddress: '172.18.0.5',
  },
  {
    container_id: 'e5f6a1b2c3d47890abcdef90',
    name: 'worker-job-processor',
    image: 'python:3.11-slim',
    status: 'Exited (0) 45 minutes ago',
    created: '1 day ago',
    ports: '-',
    cpu: 0.0,
    memory: '0 MB',
    ipAddress: '172.18.0.6',
  },
  {
    container_id: 'f6a1b2c3d4e57890abcdef11',
    name: 'metrics-prometheus',
    image: 'prom/prometheus:v2.50.0',
    status: 'Up 1 day',
    created: '1 day ago',
    ports: '9090:9090/tcp',
    cpu: 1.2,
    memory: '88.4 MB / 2 GB',
    ipAddress: '172.18.0.7',
  },
];

const INITIAL_IMAGES: DockerImage[] = [
  {
    ID: 'sha256:7b926d83a129ef32a874b33c',
    Tag: 'nginx:1.25-alpine',
    Created_Since: '2 days ago',
    Size: '41.2 MB',
    Containers: 1,
    virtualSize: 41.2,
  },
  {
    ID: 'sha256:9c4381a938b812ef9012cd34',
    Tag: 'node:20-alpine',
    Created_Since: '5 days ago',
    Size: '178.6 MB',
    Containers: 1,
    virtualSize: 178.6,
  },
  {
    ID: 'sha256:1a82f3c09e13d548bc928172',
    Tag: 'redis:7.2-alpine',
    Created_Since: '1 week ago',
    Size: '35.4 MB',
    Containers: 1,
    virtualSize: 35.4,
  },
  {
    ID: 'sha256:d89402a1b9423c881093ef44',
    Tag: 'postgres:16.2',
    Created_Since: '2 weeks ago',
    Size: '379.0 MB',
    Containers: 1,
    virtualSize: 379.0,
  },
  {
    ID: 'sha256:4481093ef89402a1b9423c88',
    Tag: 'python:3.11-slim',
    Created_Since: '3 weeks ago',
    Size: '154.3 MB',
    Containers: 1,
    virtualSize: 154.3,
  },
  {
    ID: 'sha256:33c7b926d83a129ef32a874b',
    Tag: 'prom/prometheus:v2.50.0',
    Created_Since: '1 month ago',
    Size: '210.5 MB',
    Containers: 1,
    virtualSize: 210.5,
  },
  {
    ID: 'sha256:8812ef9012cd349c4381a938',
    Tag: 'ubuntu:24.04 (unused)',
    Created_Since: '1 month ago',
    Size: '77.8 MB',
    Containers: 0,
    virtualSize: 77.8,
  },
];

class DockerApiClient {
  private customApis: string[] = [...DEFAULT_APIS];
  private activeApi: string | null = null;
  private isSimulationMode = false;
  private simulatedContainers: DockerContainer[] = [...INITIAL_CONTAINERS];
  private simulatedImages: DockerImage[] = [...INITIAL_IMAGES];
  private mockLogsHistory: Record<string, string[]> = {};

  constructor() {
    this.initMockLogs();
  }

  private initMockLogs() {
    this.simulatedContainers.forEach((c) => {
      const logs: string[] = [];
      const now = new Date();
      const prefix = `[${c.name}]`;

      if (c.image.includes('nginx')) {
        logs.push(`${new Date(now.getTime() - 100000).toISOString()} ${prefix} [notice] 1#1: using the "epoll" event method`);
        logs.push(`${new Date(now.getTime() - 90000).toISOString()} ${prefix} [notice] 1#1: nginx/1.25.4 started`);
        logs.push(`${new Date(now.getTime() - 80000).toISOString()} ${prefix} [notice] 1#1: built by gcc 13.2.1 20231014 (Alpine 13.2.1_git20231014)`);
        logs.push(`${new Date(now.getTime() - 50000).toISOString()} ${prefix} 192.168.1.45 - - "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0"`);
        logs.push(`${new Date(now.getTime() - 20000).toISOString()} ${prefix} 192.168.1.88 - - "GET /api/health HTTP/1.1" 200 45 "-" "curl/8.4.0"`);
      } else if (c.image.includes('node')) {
        logs.push(`${new Date(now.getTime() - 95000).toISOString()} ${prefix} Server listening on port 3000 in production mode`);
        logs.push(`${new Date(now.getTime() - 75000).toISOString()} ${prefix} Database pool initialized (max_connections: 20)`);
        logs.push(`${new Date(now.getTime() - 40000).toISOString()} ${prefix} INFO: Auth request validated for user=admin (14ms)`);
        logs.push(`${new Date(now.getTime() - 15000).toISOString()} ${prefix} INFO: Dispatched job #8491 to worker pool`);
      } else if (c.image.includes('redis')) {
        logs.push(`${new Date(now.getTime() - 120000).toISOString()} ${prefix} 1:M 21 Sep 2024 10:14:02.100 * Running mode=standalone, port=6379.`);
        logs.push(`${new Date(now.getTime() - 110000).toISOString()} ${prefix} 1:M 21 Sep 2024 10:14:02.105 # Server initialized`);
        logs.push(`${new Date(now.getTime() - 60000).toISOString()} ${prefix} 1:M 21 Sep 2024 10:15:00.012 * DB saved on disk`);
        logs.push(`${new Date(now.getTime() - 5000).toISOString()} ${prefix} 1:M 21 Sep 2024 10:15:58.341 * 12 clients connected, 4529 ops/sec`);
      } else if (c.image.includes('postgres')) {
        logs.push(`${new Date(now.getTime() - 140000).toISOString()} ${prefix} Postmaster starting; PostgreSQL 16.2 on x86_64-pc-linux-musl`);
        logs.push(`${new Date(now.getTime() - 130000).toISOString()} ${prefix} database system was shut down at 2024-09-21 04:12:00 UTC`);
        logs.push(`${new Date(now.getTime() - 120000).toISOString()} ${prefix} database system is ready to accept connections`);
        logs.push(`${new Date(now.getTime() - 30000).toISOString()} ${prefix} LOG: checkpoint starting: time`);
        logs.push(`${new Date(now.getTime() - 10000).toISOString()} ${prefix} LOG: checkpoint complete: wrote 42 buffers (0.3%); 0 WAL file(s) added`);
      } else {
        logs.push(`${new Date(now.getTime() - 60000).toISOString()} ${prefix} Initialized service component`);
        logs.push(`${new Date(now.getTime() - 45000).toISOString()} ${prefix} Batch job finished with code 0`);
      }
      this.mockLogsHistory[c.container_id] = logs;
    });
  }

  public getSimulationStatus() {
    return {
      isSimulation: this.isSimulationMode,
      activeApi: this.activeApi,
      apiEndpoints: this.customApis,
    };
  }

  public addApiEndpoint(url: string) {
    if (!this.customApis.includes(url)) {
      this.customApis.unshift(url);
    }
  }

  public setForceSimulation(enable: boolean) {
    this.isSimulationMode = enable;
    if (enable) this.activeApi = 'Mock Docker Daemon (In-Memory)';
  }

  private async fetchWithFallback(path: string, options: RequestInit = {}, timeout = 2500) {
    if (this.isSimulationMode) {
      throw new Error('Simulation mode active');
    }

    const servers = this.activeApi
      ? [this.activeApi, ...this.customApis.filter((a) => a !== this.activeApi)]
      : this.customApis;

    for (const baseUrl of servers) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        const res = await fetch(`${baseUrl}${path}`, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        this.activeApi = baseUrl;
        this.isSimulationMode = false;
        return await res.json();
      } catch {
        // Try next fallback endpoint
      }
    }

    // All real endpoints failed -> auto switch to intelligent simulation mode
    this.isSimulationMode = true;
    this.activeApi = 'Simulated Docker Engine (Local)';
    throw new Error('All APIs unreachable; falling back to simulated Docker engine');
  }

  public async getContainers(): Promise<DockerContainer[]> {
    try {
      const data = await this.fetchWithFallback('/get/all/containers');
      return Array.isArray(data) ? data : [];
    } catch {
      return [...this.simulatedContainers];
    }
  }

  public async getImages(): Promise<DockerImage[]> {
    try {
      const data = await this.fetchWithFallback('/get/all/images');
      return Array.isArray(data) ? data : [];
    } catch {
      return [...this.simulatedImages];
    }
  }

  public async getLogs(containerId: string, tail = 200, timestamps = true): Promise<string> {
    try {
      const data = await this.fetchWithFallback('/logs/container', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ containerId, tail, timestamps }),
      });
      return data.logs || 'No logs found.';
    } catch {
      const logs = this.mockLogsHistory[containerId] || [];
      // Generate a fresh live line if container is running
      const container = this.simulatedContainers.find((c) => c.container_id === containerId);
      if (container && container.status.includes('Up')) {
        const freshLine = `${new Date().toISOString()} [${container.name}] Heartbeat OK - CPU: ${(Math.random() * 4 + 0.5).toFixed(1)}% - Connections: ${Math.floor(Math.random() * 20 + 5)}`;
        if (logs.length > 50) logs.shift();
        logs.push(freshLine);
        this.mockLogsHistory[containerId] = logs;
      }
      return logs.length > 0 ? logs.join('\n') : `[${container?.name || containerId}] Container is starting up... Waiting for stdout/stderr`;
    }
  }

  public async startContainer(containerId: string): Promise<void> {
    try {
      await this.fetchWithFallback('/start/container', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ containerId }),
      });
    } catch {
      this.simulatedContainers = this.simulatedContainers.map((c) =>
        c.container_id === containerId
          ? { ...c, status: 'Up Just now', cpu: 1.5, memory: '45 MB / 2 GB' }
          : c
      );
      if (this.mockLogsHistory[containerId]) {
        this.mockLogsHistory[containerId].push(`${new Date().toISOString()} Container started successfully (Signal: SIGCONT)`);
      }
    }
  }

  public async stopContainer(containerId: string): Promise<void> {
    try {
      await this.fetchWithFallback('/stop/container', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ containerId }),
      });
    } catch {
      this.simulatedContainers = this.simulatedContainers.map((c) =>
        c.container_id === containerId
          ? { ...c, status: 'Exited (0) Just now', cpu: 0, memory: '0 MB' }
          : c
      );
      if (this.mockLogsHistory[containerId]) {
        this.mockLogsHistory[containerId].push(`${new Date().toISOString()} Received SIGTERM, graceful shutdown complete.`);
      }
    }
  }

  public async restartContainer(containerId: string): Promise<void> {
    try {
      await this.fetchWithFallback('/restart/container', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ containerId }),
      });
    } catch {
      this.simulatedContainers = this.simulatedContainers.map((c) =>
        c.container_id === containerId
          ? { ...c, status: 'Up 1 second (healthy)', cpu: 2.2, memory: '52 MB / 2 GB' }
          : c
      );
      if (this.mockLogsHistory[containerId]) {
        this.mockLogsHistory[containerId].push(`${new Date().toISOString()} Container restart sequence executed.`);
      }
    }
  }

  public async removeContainer(containerId: string): Promise<void> {
    try {
      await this.fetchWithFallback('/remove/container', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ containerId }),
      });
    } catch {
      this.simulatedContainers = this.simulatedContainers.filter((c) => c.container_id !== containerId);
      delete this.mockLogsHistory[containerId];
    }
  }

  public async removeImage(imageId: string): Promise<void> {
    try {
      await this.fetchWithFallback('/remove/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId }),
      });
    } catch {
      this.simulatedImages = this.simulatedImages.filter((i) => i.ID !== imageId);
    }
  }

  public async removeAllImages(): Promise<void> {
    try {
      const ids = this.simulatedImages.map((i) => i.ID);
      await this.fetchWithFallback('/remove/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: ids }),
      });
    } catch {
      this.simulatedImages = [];
    }
  }

  public createDemoContainer(name: string, image: string, port: string): DockerContainer {
    const newId = 'c' + Math.random().toString(16).substring(2, 14) + Math.random().toString(16).substring(2, 14);
    const newContainer: DockerContainer = {
      container_id: newId,
      name: name.trim() || `app-${Math.floor(Math.random() * 1000)}`,
      image: image || 'nginx:alpine',
      status: 'Up Just now',
      created: 'Just now',
      ports: port || '8080:80/tcp',
      cpu: 0.5,
      memory: '22 MB / 2 GB',
      ipAddress: `172.18.0.${Math.floor(Math.random() * 200 + 10)}`,
    };
    this.simulatedContainers.unshift(newContainer);
    this.mockLogsHistory[newId] = [
      `${new Date().toISOString()} [${newContainer.name}] Container created and initialized`,
      `${new Date().toISOString()} [${newContainer.name}] Listening on exposed ports: ${newContainer.ports}`,
    ];
    return newContainer;
  }

  public resetSimulationData() {
    this.simulatedContainers = [...INITIAL_CONTAINERS];
    this.simulatedImages = [...INITIAL_IMAGES];
    this.initMockLogs();
  }
}

export const dockerApi = new DockerApiClient();
