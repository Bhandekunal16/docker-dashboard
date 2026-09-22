import React, { useState } from 'react';
import { X, Play, Layers } from 'lucide-react';
import { DockerImage } from '../types';

interface CreateContainerModalProps {
  isOpen: boolean;
  images: DockerImage[];
  onClose: () => void;
  onCreate: (name: string, image: string, port: string) => void;
}

const TEMPLATES = [
  { name: 'web-nginx', image: 'nginx:1.25-alpine', port: '8080:80/tcp' },
  { name: 'cache-redis', image: 'redis:7.2-alpine', port: '6379:6379/tcp' },
  { name: 'db-postgres', image: 'postgres:16.2', port: '5432:5432/tcp' },
  { name: 'api-node', image: 'node:20-alpine', port: '3000:3000/tcp' },
];

export const CreateContainerModal: React.FC<CreateContainerModalProps> = ({
  isOpen,
  images,
  onClose,
  onCreate,
}) => {
  const [containerName, setContainerName] = useState('');
  const [selectedImage, setSelectedImage] = useState(
    images[0]?.Tag || 'nginx:1.25-alpine'
  );
  const [portMapping, setPortMapping] = useState('8080:80/tcp');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(containerName, selectedImage, portMapping);
    setContainerName('');
    onClose();
  };

  const applyTemplate = (tpl: (typeof TEMPLATES)[0]) => {
    setContainerName(tpl.name + '-' + Math.floor(Math.random() * 900 + 100));
    setSelectedImage(tpl.image);
    setPortMapping(tpl.port);
  };

  return (
    <div
      id="create-container-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        id="create-container-modal-content"
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Run New Container</h3>
              <p className="text-xs text-slate-400">Initialize and boot a container instance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick presets (Hick's Law) */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Quick Templates
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.name}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-left transition-colors group"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-200 truncate">{tpl.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{tpl.image}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Container Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. web-app-prod"
              value={containerName}
              onChange={(e) => setContainerName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Docker Image Tag
            </label>
            <div className="flex gap-2">
              <select
                value={selectedImage}
                onChange={(e) => setSelectedImage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              >
                {images.map((img) => (
                  <option key={img.ID} value={img.Tag}>
                    {img.Tag} ({img.Size})
                  </option>
                ))}
                <option value="nginx:latest">nginx:latest</option>
                <option value="alpine:latest">alpine:latest</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Port Bindings (Host:Container)
            </label>
            <input
              type="text"
              placeholder="8080:80/tcp"
              value={portMapping}
              onChange={(e) => setPortMapping(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 shadow-md"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Container</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
