import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Header,
} from './components/Header';
import { MetricOverview } from './components/MetricOverview';
import { ContainersTable } from './components/ContainersTable';
import { ImagesTable } from './components/ImagesTable';
import { LogsViewer } from './components/LogsViewer';
import { ConfirmationModal } from './components/ConfirmationModal';
import { CreateContainerModal } from './components/CreateContainerModal';
import { UIPrinciplesGuide } from './components/UIPrinciplesGuide';
import { dockerApi } from './services/dockerApi';
import { DockerContainer, DockerImage, ViewTab, ContainerFilterStatus } from './types';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

interface ToastInfo {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('containers');
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [images, setImages] = useState<DockerImage[]>([]);
  const [activeFilter, setActiveFilter] = useState<ContainerFilterStatus>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState<number>(10);

  // Logs state
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [selectedContainerName, setSelectedContainerName] = useState<string | null>(null);
  const [logsContent, setLogsContent] = useState<string>('');
  const [isLogsLoading, setIsLogsLoading] = useState<boolean>(false);
  const [tailCount, setTailCount] = useState<number>(200);
  const [includeTimestamps, setIncludeTimestamps] = useState<boolean>(true);

  // API connection info
  const [apiState, setApiState] = useState(dockerApi.getSimulationStatus());

  // Modal dialog states
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    confirmVariant?: 'danger' | 'warning' | 'primary';
    requireTypedConfirmation?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [isPrinciplesGuideOpen, setIsPrinciplesGuideOpen] = useState(false);
  const [isCreateContainerOpen, setIsCreateContainerOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Fetch all core data
  const loadData = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    try {
      const [containerData, imageData] = await Promise.all([
        dockerApi.getContainers(),
        dockerApi.getImages(),
      ]);

      setContainers(containerData);
      setImages(imageData);
      setApiState(dockerApi.getSimulationStatus());

      // If a container was selected for logs, refresh its log stream as well
      if (selectedContainerId) {
        const freshLogs = await dockerApi.getLogs(selectedContainerId, tailCount, includeTimestamps);
        setLogsContent(freshLogs);
      }
    } catch {
      addToast('Error synchronizing Docker state', 'error');
    } finally {
      if (!quiet) setIsLoading(false);
    }
  }, [selectedContainerId, tailCount, includeTimestamps, addToast]);

  // Initial load
  useEffect(() => {
    loadData();
    // Auto-select first container for logs if none selected
    dockerApi.getContainers().then((cList) => {
      if (cList.length > 0 && !selectedContainerId) {
        setSelectedContainerId(cList[0].container_id);
        setSelectedContainerName(cList[0].name);
        dockerApi.getLogs(cList[0].container_id, tailCount, includeTimestamps).then(setLogsContent);
      }
    });
  }, [loadData, selectedContainerId, tailCount, includeTimestamps]);

  // Auto-refresh interval
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoRefresh) {
      timerRef.current = setInterval(() => {
        loadData(true);
      }, refreshIntervalSec * 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh, refreshIntervalSec, loadData]);

  // Select container for logs
  const handleSelectContainerForLogs = async (id: string, name: string) => {
    setSelectedContainerId(id);
    setSelectedContainerName(name);
    setActiveTab('logs');
    setIsLogsLoading(true);
    try {
      const logs = await dockerApi.getLogs(id, tailCount, includeTimestamps);
      setLogsContent(logs);
      addToast(`Attached live console stream for "${name}"`, 'info');
    } catch {
      addToast(`Failed to fetch logs for ${name}`, 'error');
    } finally {
      setIsLogsLoading(false);
    }
  };

  const handleRefreshCurrentLogs = async () => {
    if (!selectedContainerId) return;
    setIsLogsLoading(true);
    try {
      const logs = await dockerApi.getLogs(selectedContainerId, tailCount, includeTimestamps);
      setLogsContent(logs);
      addToast('Console stream updated', 'info');
    } finally {
      setIsLogsLoading(false);
    }
  };

  // Container Actions
  const handleStartContainer = async (id: string, name: string) => {
    try {
      await dockerApi.startContainer(id);
      addToast(`Started container "${name}"`, 'success');
      loadData(true);
    } catch {
      addToast(`Failed to start container "${name}"`, 'error');
    }
  };

  const handleStopContainer = (id: string, name: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Stop Container?',
      message: `Are you sure you want to stop container "${name}"? Active processes will receive a SIGTERM signal.`,
      confirmText: 'Stop Container',
      confirmVariant: 'warning',
      onConfirm: async () => {
        try {
          await dockerApi.stopContainer(id);
          addToast(`Stopped container "${name}"`, 'info');
          loadData(true);
        } catch {
          addToast(`Failed to stop container "${name}"`, 'error');
        }
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleRestartContainer = (id: string, name: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Restart Container?',
      message: `Are you sure you want to restart container "${name}"? Network traffic will briefly drop during reboot.`,
      confirmText: 'Restart Container',
      confirmVariant: 'primary',
      onConfirm: async () => {
        try {
          await dockerApi.restartContainer(id);
          addToast(`Restarted container "${name}"`, 'success');
          loadData(true);
        } catch {
          addToast(`Failed to restart container "${name}"`, 'error');
        }
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleRemoveContainer = (id: string, name: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Remove Container?',
      message: `Are you sure you want to permanently delete container "${name}" (${id.slice(0, 12)})? Any non-persisted anonymous volume data will be purged.`,
      confirmText: 'Permanently Remove',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          await dockerApi.removeContainer(id);
          addToast(`Removed container "${name}"`, 'info');
          if (selectedContainerId === id) {
            setSelectedContainerId(null);
            setSelectedContainerName(null);
            setLogsContent('Container was removed.');
          }
          loadData(true);
        } catch {
          addToast(`Failed to remove container "${name}"`, 'error');
        }
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Bulk actions on containers
  const handleBulkAction = (action: 'start' | 'stop' | 'restart' | 'remove', ids: string[]) => {
    if (ids.length === 0) return;

    const actionLabels = {
      start: 'Start',
      stop: 'Stop',
      restart: 'Restart',
      remove: 'Permanently Remove',
    };

    setModalConfig({
      isOpen: true,
      title: `${actionLabels[action]} ${ids.length} Containers?`,
      message: `You are about to execute "${action}" on ${ids.length} selected containers simultaneously.`,
      confirmText: `Execute ${actionLabels[action]}`,
      confirmVariant: action === 'remove' ? 'danger' : action === 'stop' ? 'warning' : 'primary',
      onConfirm: async () => {
        for (const id of ids) {
          if (action === 'start') await dockerApi.startContainer(id);
          if (action === 'stop') await dockerApi.stopContainer(id);
          if (action === 'restart') await dockerApi.restartContainer(id);
          if (action === 'remove') await dockerApi.removeContainer(id);
        }
        addToast(`Bulk ${action} completed on ${ids.length} containers`, 'success');
        loadData(true);
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Image Actions
  const handleRemoveImage = (id: string, tag: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Remove Docker Image?',
      message: `Delete image "${tag || id.slice(0, 12)}"? This will free disk space on the Docker host.`,
      confirmText: 'Remove Image',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          await dockerApi.removeImage(id);
          addToast(`Image "${tag || id.slice(0, 12)}" removed`, 'info');
          loadData(true);
        } catch {
          addToast('Failed to remove image', 'error');
        }
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleRemoveAllImages = () => {
    setModalConfig({
      isOpen: true,
      title: '🚨 DANGER: Remove ALL Local Images?',
      message: `This will erase all ${images.length} Docker images from host storage. Next builds or container runs will require re-pulling from registry.`,
      confirmText: 'Confirm Nuclear Removal',
      confirmVariant: 'danger',
      requireTypedConfirmation: 'REMOVE ALL',
      onConfirm: async () => {
        try {
          await dockerApi.removeAllImages();
          addToast('All local Docker images have been purged', 'info');
          loadData(true);
        } catch {
          addToast('Failed to remove all images', 'error');
        }
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handlePruneUnusedImages = () => {
    const unused = images.filter((i) => i.Containers === 0);
    setModalConfig({
      isOpen: true,
      title: 'Prune Unused Images?',
      message: `Remove ${unused.length} unreferenced images not currently associated with any running or stopped containers.`,
      confirmText: 'Prune Unused',
      confirmVariant: 'warning',
      onConfirm: async () => {
        for (const img of unused) {
          await dockerApi.removeImage(img.ID);
        }
        addToast(`Pruned ${unused.length} unused images`, 'success');
        loadData(true);
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Create Container
  const handleCreateContainer = (name: string, image: string, port: string) => {
    const newContainer = dockerApi.createDemoContainer(name, image, port);
    addToast(`Launched container "${newContainer.name}"`, 'success');
    loadData(true);
    handleSelectContainerForLogs(newContainer.container_id, newContainer.name);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Toast Notification Stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-700/80 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-700/80 text-rose-200'
                : 'bg-slate-900/95 border-slate-700 text-slate-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-cyan-400 shrink-0" />
            )}
            <p className="text-xs font-medium leading-tight flex-1">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoading={isLoading}
        onRefresh={() => {
          loadData();
          addToast('Synchronized Docker state', 'info');
        }}
        isSimulation={apiState.isSimulation}
        activeEndpoint={apiState.activeApi}
        apiEndpoints={apiState.apiEndpoints}
        onSelectEndpoint={() => {}}
        onAddEndpoint={(url) => {
          dockerApi.addApiEndpoint(url);
          setApiState(dockerApi.getSimulationStatus());
          loadData();
          addToast(`Added endpoint ${url}`, 'info');
        }}
        onTogglePrinciplesGuide={() => setIsPrinciplesGuideOpen(true)}
        onOpenCreateContainer={() => setIsCreateContainerOpen(true)}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        refreshIntervalSec={refreshIntervalSec}
        setRefreshIntervalSec={setRefreshIntervalSec}
      />

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Metric Overview - Miller's Law (Chunking 5 metrics) */}
        <MetricOverview
          containers={containers}
          images={images}
          selectedContainerId={selectedContainerId}
          activeFilter={activeFilter}
          onSelectFilter={(filter) => {
            setActiveFilter(filter);
            setActiveTab('containers');
          }}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />

        {/* Tab Views */}
        {activeTab === 'containers' && (
          <ContainersTable
            containers={containers}
            selectedContainerId={selectedContainerId}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            onSelectContainerForLogs={handleSelectContainerForLogs}
            onStartContainer={handleStartContainer}
            onStopContainer={handleStopContainer}
            onRestartContainer={handleRestartContainer}
            onRemoveContainer={handleRemoveContainer}
            onBulkAction={handleBulkAction}
          />
        )}

        {activeTab === 'images' && (
          <ImagesTable
            images={images}
            onRemoveImage={handleRemoveImage}
            onRemoveAllImages={handleRemoveAllImages}
            onPruneUnusedImages={handlePruneUnusedImages}
          />
        )}

        {activeTab === 'logs' && (
          <LogsViewer
            containers={containers}
            selectedContainerId={selectedContainerId}
            selectedContainerName={selectedContainerName}
            logsContent={logsContent}
            isLoading={isLogsLoading}
            onSelectContainer={handleSelectContainerForLogs}
            onRefreshLogs={handleRefreshCurrentLogs}
            onClearLogs={() => {
              setLogsContent('Logs cleared.');
              addToast('Log buffer cleared', 'info');
            }}
            tailCount={tailCount}
            setTailCount={setTailCount}
            includeTimestamps={includeTimestamps}
            setIncludeTimestamps={setIncludeTimestamps}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>Docker Manager © 2026</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400 font-mono text-[11px]">Engine v26.1-ce</span>
          </div>

          <button
            onClick={() => setIsPrinciplesGuideOpen(true)}
            className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>UI Principles: Hick's, Fitts's, Jakob's, Miller's, Proximity, Aesthetic</span>
          </button>
        </div>
      </footer>

      {/* Modals */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        confirmVariant={modalConfig.confirmVariant}
        requireTypedConfirmation={modalConfig.requireTypedConfirmation}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      <CreateContainerModal
        isOpen={isCreateContainerOpen}
        images={images}
        onClose={() => setIsCreateContainerOpen(false)}
        onCreate={handleCreateContainer}
      />

      <UIPrinciplesGuide
        isOpen={isPrinciplesGuideOpen}
        onClose={() => setIsPrinciplesGuideOpen(false)}
      />
    </div>
  );
}
