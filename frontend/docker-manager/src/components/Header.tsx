import React, { useState } from 'react';
import {
  RotateCw,
  Server,
  Plus,
  BookOpen,
  Wifi,
  Settings2,
  CheckCircle2,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import { ViewTab } from '../types';

interface HeaderProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  isLoading: boolean;
  onRefresh: () => void;
  isSimulation: boolean;
  activeEndpoint: string | null;
  apiEndpoints: string[];
  onSelectEndpoint: (url: string) => void;
  onAddEndpoint: (url: string) => void;
  onTogglePrinciplesGuide: () => void;
  onOpenCreateContainer: () => void;
  autoRefresh: boolean;
  setAutoRefresh: (val: boolean) => void;
  refreshIntervalSec: number;
  setRefreshIntervalSec: (sec: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isLoading,
  onRefresh,
  isSimulation,
  activeEndpoint,
  apiEndpoints,
  onAddEndpoint,
  onTogglePrinciplesGuide,
  onOpenCreateContainer,
  autoRefresh,
  setAutoRefresh,
  refreshIntervalSec,
  setRefreshIntervalSec,
}) => {
  const [showEndpointSettings, setShowEndpointSettings] = useState(false);
  const [newEndpointUrl, setNewEndpointUrl] = useState('');

  const handleAddEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEndpointUrl.trim()) {
      onAddEndpoint(newEndpointUrl.trim());
      setNewEndpointUrl('');
      setShowEndpointSettings(false);
    }
  };

  return (
    <header id="main-header" className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md backdrop-blur-md bg-slate-900/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand & Jakob's Law standard logo recognition */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                {/* SVG Docker Whale Icon */}
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.98 10.15h2.15v2.15H13.98v-2.15zm-2.6 0h2.15v2.15h-2.15v-2.15zm-2.6 0h2.15v2.15H8.78v-2.15zm-2.6 0h2.15v2.15H6.18v-2.15zm7.8-2.6h2.15v2.15h-2.15V7.55zm-2.6 0h2.15v2.15h-2.15V7.55zm-2.6 0h2.15v2.15H8.78V7.55zm5.2-2.6h2.15v2.15h-2.15V4.95zm-2.6 0h2.15v2.15h-2.15V4.95zm11.19 7.62c-.44-.3-1.42-.36-2.2-.17-.13-.77-.55-1.47-1.18-1.95l-.39-.28-.31.37c-.36.43-.88.75-1.48.91l-.47.12-.02.48c-.02.43-.09.85-.22 1.25H1.47c-.26.83-.4 1.7-.4 2.6 0 4.41 3.59 8 8 8 3.86 0 7.09-2.74 7.85-6.39 1.13-.19 2.76-.79 3.65-2.69.08-.16.14-.32.18-.49.25-.1.52-.22.75-.38.51-.35.88-.85 1.05-1.42.06-.21.05-.33-.06-.45l-.3-.21z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                    Docker Manager
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
                    v2.4 Pro
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      isSimulation ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
                    }`}
                  />
                  <span className="truncate max-w-[200px] sm:max-w-[320px]">
                    {isSimulation
                      ? 'Simulated Daemon (Active)'
                      : activeEndpoint || 'Fallback APIs Ready'}
                  </span>
                  <button
                    id="endpoint-settings-toggle"
                    onClick={() => setShowEndpointSettings(!showEndpointSettings)}
                    className="text-slate-400 hover:text-cyan-400 ml-1 transition-colors"
                    title="API Server Configurations"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Hub - Fitts's Law comfortable click zones & Gestalt proximity */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* UI Principles Guide Badge Button */}
            <button
              id="ui-principles-guide-btn"
              onClick={onTogglePrinciplesGuide}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-950/70 text-indigo-300 border border-indigo-700/50 hover:bg-indigo-900/80 hover:text-indigo-200 transition-all shadow-sm"
              title="Inspect how Hick's, Fitts's, Jakob's, Miller's, Proximity, & Aesthetic laws are applied"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>UI Principles</span>
              <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-mono">
                6 Rules
              </span>
            </button>

            {/* Launch Container Quick Action */}
            <button
              id="header-create-container-btn"
              onClick={onOpenCreateContainer}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden xs:inline">Run Container</span>
            </button>

            {/* Auto refresh timer & Reload button */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700/70 rounded-lg p-0.5">
              <button
                id="header-reload-btn"
                onClick={onRefresh}
                disabled={isLoading}
                title="Reload containers, images, and logs"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-700/70 rounded-md transition-colors disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
                <span className="hidden sm:inline">Reload</span>
              </button>

              <div className="h-4 w-px bg-slate-700 mx-1" />

              <div className="flex items-center px-2 py-1 gap-1.5 text-xs text-slate-400">
                <input
                  type="checkbox"
                  id="auto-refresh-check"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                />
                <label htmlFor="auto-refresh-check" className="cursor-pointer select-none text-[11px] hidden sm:inline">
                  Auto
                </label>
                {autoRefresh && (
                  <select
                    id="auto-refresh-interval-select"
                    value={refreshIntervalSec}
                    onChange={(e) => setRefreshIntervalSec(Number(e.target.value))}
                    className="bg-slate-900 text-slate-300 text-[10px] rounded px-1 py-0.5 border border-slate-700 focus:outline-none"
                  >
                    <option value={5}>5s</option>
                    <option value={10}>10s</option>
                    <option value={30}>30s</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Jakob's Law familiar segment control & Miller's chunking */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 pb-3 overflow-x-auto gap-2">
          <nav className="flex space-x-1" aria-label="Dashboard Views">
            <button
              id="nav-tab-containers"
              onClick={() => setActiveTab('containers')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'containers'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>Containers</span>
            </button>

            <button
              id="nav-tab-images"
              onClick={() => setActiveTab('images')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'images'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {/* Layers icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2}" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <span>Images</span>
            </button>

            <button
              id="nav-tab-logs"
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'logs'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {/* Terminal icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              <span>Console Logs</span>
            </button>
          </nav>

          <button
            id="mobile-principles-guide-btn"
            onClick={onTogglePrinciplesGuide}
            className="md:hidden flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 px-2.5 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 whitespace-nowrap"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>UI Principles</span>
          </button>
        </div>
      </div>

      {/* Endpoint configuration panel modal/popover */}
      {showEndpointSettings && (
        <div className="border-t border-slate-800 bg-slate-950/95 px-4 py-4 transition-all">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                Docker Daemon Fallback Endpoints (from code)
              </h3>
              <button
                onClick={() => setShowEndpointSettings(false)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Dismiss
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="space-y-1.5">
                <p className="text-xs text-slate-400">Configured Endpoints:</p>
                <div className="flex flex-wrap gap-2">
                  {apiEndpoints.map((url) => (
                    <div
                      key={url}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border font-mono ${
                        activeEndpoint === url
                          ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      <span>{url}</span>
                      {activeEndpoint === url && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAddEndpoint} className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1">Add Custom Endpoint</label>
                  <input
                    type="text"
                    placeholder="http://127.0.0.1:5000"
                    value={newEndpointUrl}
                    onChange={(e) => setNewEndpointUrl(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1 h-[32px]"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add
                </button>
              </form>
            </div>
            <p className="text-[11px] text-slate-500">
              * The app automatically attempts connection to your Docker API servers. If unreachable in this browser sandbox, it effortlessly activates the responsive built-in simulation daemon.
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
