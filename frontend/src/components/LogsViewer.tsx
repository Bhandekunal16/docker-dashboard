import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Trash2,
  Copy,
  Download,
  Search,
  Check,
  Radio,
  ArrowDown,
  Clock,
  Filter,
} from 'lucide-react';
import { DockerContainer } from '../types';

interface LogsViewerProps {
  containers: DockerContainer[];
  selectedContainerId: string | null;
  selectedContainerName: string | null;
  logsContent: string;
  isLoading: boolean;
  onSelectContainer: (id: string, name: string) => void;
  onRefreshLogs: () => void;
  onClearLogs: () => void;
  tailCount: number;
  setTailCount: (count: number) => void;
  includeTimestamps: boolean;
  setIncludeTimestamps: (val: boolean) => void;
}

export const LogsViewer: React.FC<LogsViewerProps> = ({
  containers,
  selectedContainerId,
  selectedContainerName,
  logsContent,
  isLoading,
  onSelectContainer,
  onRefreshLogs,
  onClearLogs,
  tailCount,
  setTailCount,
  includeTimestamps,
  setIncludeTimestamps,
}) => {
  const [logSearch, setLogSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const selectedContainer = containers.find((c) => c.container_id === selectedContainerId);

  // Auto-scroll to bottom on new log lines if autoScroll is enabled
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logsContent, autoScroll]);

  const handleCopyLogs = () => {
    if (!logsContent) return;
    navigator.clipboard.writeText(logsContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    if (!logsContent) return;
    const blob = new Blob([logsContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedContainerName || 'container'}-logs-${new Date().toISOString().slice(0, 10)}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter log lines if search is active
  const logLines = logsContent.split('\n');
  const filteredLines = logSearch.trim()
    ? logLines.filter((line) => line.toLowerCase().includes(logSearch.toLowerCase()))
    : logLines;

  return (
    <div id="logs-console-section" className="space-y-4">
      {/* Top Container Switcher & Command Toolbar - Jakob's Law terminal toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Target Container Dropdown */}
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider shrink-0">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Target:</span>
            </div>
            <select
              id="logs-container-select"
              value={selectedContainerId || ''}
              onChange={(e) => {
                const target = containers.find((c) => c.container_id === e.target.value);
                if (target) {
                  onSelectContainer(target.container_id, target.name);
                }
              }}
              className="flex-1 max-w-md bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="" disabled>
                -- Select a Container to Tail --
              </option>
              {containers.map((c) => (
                <option key={c.container_id} value={c.container_id}>
                  {c.name} ({c.image}) - {c.status}
                </option>
              ))}
            </select>

            {selectedContainer && (
              <span
                className={`hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-medium ${
                  selectedContainer.status.toLowerCase().includes('up')
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                Live
              </span>
            )}
          </div>

          {/* Quick Toolbar Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tail lines count */}
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400">
              <Filter className="w-3 h-3 text-slate-500" />
              <span className="text-[11px]">Tail:</span>
              <select
                id="logs-tail-select"
                value={tailCount}
                onChange={(e) => setTailCount(Number(e.target.value))}
                className="bg-transparent text-slate-200 text-xs font-mono focus:outline-none cursor-pointer"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
              </select>
            </div>

            {/* Timestamps toggle */}
            <button
              id="logs-timestamp-toggle"
              onClick={() => setIncludeTimestamps(!includeTimestamps)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                includeTimestamps
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700/60'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Toggle timestamps in log lines"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Time</span>
            </button>

            {/* Auto-scroll toggle */}
            <button
              id="logs-autoscroll-toggle"
              onClick={() => setAutoScroll(!autoScroll)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                autoScroll
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Follow log stream automatically"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Auto-scroll</span>
            </button>

            {/* Copy Logs */}
            <button
              id="logs-copy-btn"
              onClick={handleCopyLogs}
              disabled={!logsContent}
              className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 rounded-lg border border-slate-800 transition-colors disabled:opacity-40"
              title="Copy output to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Download Logs */}
            <button
              id="logs-download-btn"
              onClick={handleDownloadLogs}
              disabled={!logsContent}
              className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 rounded-lg border border-slate-800 transition-colors disabled:opacity-40"
              title="Download .log file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Reset Logs */}
            <button
              id="logs-clear-btn"
              onClick={onClearLogs}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
              title="Clear active log viewer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* In-Terminal Filter Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="logs-filter-input"
            type="text"
            placeholder="Search within stdout/stderr lines (regex or keywords like 'error', 'GET', '200')..."
            value={logSearch}
            onChange={(e) => setLogSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-cyan-500"
          />
          {logSearch && (
            <button
              onClick={() => setLogSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Terminal Display Area - Aesthetic-Usability Effect and Jakob's Law */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Terminal Title Bar */}
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-xs font-mono text-slate-400 ml-2">
              bash - {selectedContainerName || 'no-container-attached'} (tail -n {tailCount})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isLoading && (
              <span className="text-[11px] text-cyan-400 font-mono animate-pulse">
                Fetching stream...
              </span>
            )}
            <span className="text-[11px] text-slate-500 font-mono">
              {filteredLines.length} lines {logSearch && `(filtered)`}
            </span>
          </div>
        </div>

        {/* Terminal Body */}
        <div
          id="logs-terminal-output"
          className="p-4 font-mono text-xs text-slate-300 bg-[#070b14] h-[480px] overflow-y-auto space-y-1 select-text leading-relaxed"
        >
          {selectedContainerId ? (
            filteredLines.length > 0 ? (
              filteredLines.map((line, idx) => {
                const isError = /error|failed|fatal|err|crit/i.test(line);
                const isWarn = /warn|warning/i.test(line);
                const isNotice = /notice|info|log/i.test(line);
                const isHttp200 = /200|304|OK/i.test(line);

                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 hover:bg-slate-800/40 px-1 py-0.5 rounded transition-colors ${
                      isError
                        ? 'text-rose-300 bg-rose-950/20'
                        : isWarn
                        ? 'text-amber-300 bg-amber-950/20'
                        : isHttp200
                        ? 'text-emerald-300'
                        : isNotice
                        ? 'text-cyan-200'
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="text-slate-600 select-none text-[10px] w-8 text-right shrink-0">
                      {idx + 1}
                    </span>
                    <span className="break-all whitespace-pre-wrap">{line}</span>
                  </div>
                );
              })
            ) : (
              <div className="text-slate-500 italic py-8 text-center">
                No logs match your filter term "{logSearch}".
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3">
              <Terminal className="w-10 h-10 text-slate-700" />
              <p className="text-sm font-medium">Select a container to attach live stdout/stderr streams.</p>
              <div className="flex gap-2">
                {containers.slice(0, 3).map((c) => (
                  <button
                    key={c.container_id}
                    onClick={() => onSelectContainer(c.container_id, c.name)}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-xs text-cyan-400 font-mono"
                  >
                    Attach {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
};
