export interface DockerContainer {
  container_id: string;
  name: string;
  image: string;
  status: string; // e.g., "Up 4 hours", "Exited (0) 2 hours ago"
  created?: string;
  ports?: string;
  cpu?: number;
  memory?: string;
  ipAddress?: string;
}

export interface DockerImage {
  ID: string;
  Tag: string;
  Created_Since: string;
  Size: string;
  Containers: number;
  virtualSize?: number; // in MB for charts
}

export type ViewTab = 'containers' | 'images' | 'logs' | 'system';

export type ContainerFilterStatus = 'all' | 'running' | 'exited' | 'paused';

export interface UIPrincipleInfo {
  id: string;
  name: string;
  summary: string;
  appliedInApp: string[];
  icon: string;
}
