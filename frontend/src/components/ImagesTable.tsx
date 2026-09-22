import React, { useState } from 'react';
import {
  Trash2,
  HardDrive,
  Copy,
  Check,
  Search,
  Sparkles,
  AlertOctagon,
  Layers,
  Box,
} from 'lucide-react';
import { DockerImage } from '../types';

interface ImagesTableProps {
  images: DockerImage[];
  onRemoveImage: (id: string, tag: string) => void;
  onRemoveAllImages: () => void;
  onPruneUnusedImages: () => void;
}

export const ImagesTable: React.FC<ImagesTableProps> = ({
  images,
  onRemoveImage,
  onRemoveAllImages,
  onPruneUnusedImages,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredImages = images.filter((img) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      img.Tag.toLowerCase().includes(q) ||
      img.ID.toLowerCase().includes(q) ||
      img.Size.toLowerCase().includes(q)
    );
  });

  const unusedImagesCount = images.filter((img) => img.Containers === 0).length;

  const handleCopyId = (id: string) => {
    const cleanId = id.replace('sha256:', '');
    navigator.clipboard.writeText(cleanId);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="images-section" className="space-y-4">
      {/* Search & Actions Header - Hick's Law and Fitts's Law */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          {/* Quick prune unused button */}
          <button
            id="images-prune-unused-btn"
            onClick={onPruneUnusedImages}
            disabled={unusedImagesCount === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Clean up dangling and unused images (0 active containers)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Prune Unused ({unusedImagesCount})</span>
          </button>

          {/* Remove All button with high-contrast warning design */}
          <button
            id="images-remove-all-btn"
            onClick={onRemoveAllImages}
            disabled={images.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            <span>Remove All</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="images-search-input"
            type="text"
            placeholder="Search tags, size, image ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Main Images Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Repository & Tag</th>
                <th className="px-4 py-3">Image ID</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Virtual Size</th>
                <th className="px-4 py-3">Used By</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredImages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Layers className="w-8 h-8 text-slate-600" />
                      <p>No Docker images found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredImages.map((img) => {
                  const shortId = img.ID.replace('sha256:', '').slice(0, 12);
                  const isUnused = img.Containers === 0;

                  return (
                    <tr
                      key={img.ID}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Tag / Repo */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-cyan-400 shrink-0" />
                          <div>
                            <div className="font-semibold text-sm text-slate-100 font-mono">
                              {img.Tag || '<none>:<none>'}
                            </div>
                            {isUnused && (
                              <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-800/60 rounded">
                                Unused
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Image ID */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                            {shortId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyId(img.ID)}
                            className="p-1 rounded text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                            title="Copy image ID"
                          >
                            {copiedId === img.ID ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-400">
                        {img.Created_Since}
                      </td>

                      {/* Size */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold text-indigo-300 bg-indigo-950/40 px-2.5 py-1 rounded-md border border-indigo-900/50">
                          {img.Size}
                        </span>
                      </td>

                      {/* Containers using this image */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <Box className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {img.Containers} container{img.Containers !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          id={`btn-remove-image-${shortId}`}
                          type="button"
                          onClick={() => onRemoveImage(img.ID, img.Tag)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all inline-flex items-center gap-1.5"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
