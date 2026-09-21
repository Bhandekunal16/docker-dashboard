import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
  requireTypedConfirmation?: string; // e.g. "REMOVE ALL"
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm Action',
  confirmVariant = 'danger',
  requireTypedConfirmation,
  onConfirm,
  onCancel,
}) => {
  const [typedInput, setTypedInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTypedInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmedAllowed = !requireTypedConfirmation || typedInput.trim() === requireTypedConfirmation;

  const getVariantStyles = () => {
    switch (confirmVariant) {
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600 text-slate-950 focus:ring-amber-400';
      case 'primary':
        return 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 focus:ring-cyan-400';
      case 'danger':
      default:
        return 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500';
    }
  };

  return (
    <div
      id="confirmation-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-all"
      onClick={onCancel}
    >
      <div
        id="confirmation-modal-content"
        className="relative w-full max-w-md bg-slate-900 border border-slate-700/70 rounded-xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top visual indicator bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            confirmVariant === 'danger'
              ? 'bg-rose-500'
              : confirmVariant === 'warning'
              ? 'bg-amber-500'
              : 'bg-cyan-500'
          }`}
        />

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg ${
                confirmVariant === 'danger'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : confirmVariant === 'warning'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
              }`}
            >
              {confirmVariant === 'danger' ? (
                <ShieldAlert className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 id="modal-heading" className="text-lg font-bold text-slate-100">
                {title}
              </h3>
              <p className="text-xs text-slate-400">Please review before proceeding</p>
            </div>
          </div>
          <button
            id="modal-close-btn"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p id="modal-body-text" className="text-sm text-slate-300 leading-relaxed mb-4">
          {message}
        </p>

        {requireTypedConfirmation && (
          <div className="mb-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              To verify, type <span className="font-mono text-rose-400 font-bold">{requireTypedConfirmation}</span> below:
            </label>
            <input
              type="text"
              id="modal-typed-confirm-input"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={requireTypedConfirmation}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-rose-500 font-mono"
              autoFocus
            />
          </div>
        )}

        {/* Action button grouping - Gestalt Proximity & Fitts's Law touch targets */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            id="modal-cancel-button"
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:text-white transition-colors focus:outline-none min-h-[42px]"
          >
            Cancel
          </button>
          <button
            id="modal-confirm-button"
            type="button"
            disabled={!isConfirmedAllowed}
            onClick={() => {
              if (isConfirmedAllowed) {
                onConfirm();
              }
            }}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 min-h-[42px] flex items-center gap-2 ${
              isConfirmedAllowed
                ? getVariantStyles()
                : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
            }`}
          >
            {confirmVariant === 'danger' && <Trash2 className="w-4 h-4" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
