import React from 'react';
import { Activity, Box, Database, HardDrive, Terminal } from 'lucide-react';
import { DockerContainer, DockerImage, ContainerFilterStatus } from '../types';

interface MetricOverviewProps {
  containers: DockerContainer[];
  images: DockerImage[];
  selectedContainerId: string | null;
  activeFilter: ContainerFilterStatus;
  onSelectFilter: (filter: ContainerFilterStatus) => void;
  onNavigateTab: (tab: 'containers' | 'images' | 'logs') => void;
}

export const MetricOverview: React.FC<MetricOverviewProps> = ({
  containers,
  images,
  selectedContainerId,
  activeFilter,
  onSelectFilter,
  onNavigateTab,
}) => {
  const runningCount = containers.filter((c) => c.status.toLowerCase().includes('up')).length;
  const stoppedCount = containers.length - runningCount;

  // Calculate total virtual image size in MB
  const totalImageSizeMB = images.reduce((acc, img) => {
    const numeric = parseFloat(img.Size) || 0;
    const isGB = img.Size.includes('GB');
    return acc + (isGB ? numeric * 1024 : numeric);
  }, 0);

  const formattedSize =
    totalImageSizeMB > 1024
      ? `${(totalImageSizeMB / 1024).toFixed(2)} GB`
      : `${totalImageSizeMB.toFixed(1)} MB`;

  return (
    <div id="metrics-overview" className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
      {/* 1. Running Containers - Miller's chunk 1 */}
      <button
        id="metric-running-containers"
        onClick={() => {
          onNavigateTab('containers');
          onSelectFilter('running');
        }}
        className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
          activeFilter === 'running'
            ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/40'
            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            Running
          </span>
          <Activity className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
          {runningCount}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Active instances</p>
      </button>

      {/* 2. Stopped Containers - Miller's chunk 2 */}
      <button
        id="metric-stopped-containers"
        onClick={() => {
          onNavigateTab('containers');
          onSelectFilter('exited');
        }}
        className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
          activeFilter === 'exited'
            ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/40'
            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Stopped</span>
          <Box className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-300 font-mono">
          {stoppedCount}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Exited / Inactive</p>
      </button>

      {/* 3. Total Containers - Miller's chunk 3 */}
      <button
        id="metric-total-containers"
        onClick={() => {
          onNavigateTab('containers');
          onSelectFilter('all');
        }}
        className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
          activeFilter === 'all'
            ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/40'
            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-cyan-400">Total Containers</span>
          <Database className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
          {containers.length}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Click to show all</p>
      </button>

      {/* 4. Total Images & Storage Footprint - Miller's chunk 4 */}
      <button
        id="metric-images-storage"
        onClick={() => onNavigateTab('images')}
        className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-slate-700 hover:bg-slate-900 text-left transition-all group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-indigo-400">Local Images</span>
          <HardDrive className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
          {images.length}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Footprint: <span className="text-indigo-300 font-medium">{formattedSize}</span>
        </p>
      </button>

      {/* 5. Terminal Logs Status - Miller's chunk 5 */}
      <button
        id="metric-active-logs"
        onClick={() => onNavigateTab('logs')}
        className="col-span-2 lg:col-span-1 p-4 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-slate-700 hover:bg-slate-900 text-left transition-all group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-purple-400">Terminal Logs</span>
          <Terminal className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-sm font-bold text-slate-200 truncate mt-1">
          {selectedContainerId
            ? containers.find((c) => c.container_id === selectedContainerId)?.name || 'Container Selected'
            : 'No container attached'}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {selectedContainerId ? 'Click to inspect console' : 'Select container to tail'}
        </p>
      </button>
    </div>
  );
};
