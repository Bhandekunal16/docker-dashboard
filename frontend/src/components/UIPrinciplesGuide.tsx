import React, { useState } from 'react';
import {
  X,
  Target,
  Clock,
  Compass,
  LayoutGrid,
  Sparkles,
  Layers,
  CheckCircle,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

interface UIPrinciplesGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PrincipleCard {
  id: string;
  name: string;
  badge: string;
  icon: React.ElementType;
  color: string;
  borderColor: string;
  definition: string;
  flawInLegacy: string;
  implementationInApp: string[];
}

const PRINCIPLES: PrincipleCard[] = [
  {
    id: 'hick',
    name: "Hick's Law",
    badge: 'Decision Time & Cognitive Load',
    icon: Clock,
    color: 'text-amber-400 bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    definition:
      'The time it takes to make a decision increases logarithmically with the number and complexity of choices.',
    flawInLegacy:
      'Every table row presented 4-5 buttons of equal weight simultaneously. "Remove ALL" was placed right next to routine options without progressive disclosure.',
    implementationInApp: [
      'Segmented container views (All / Running / Stopped) to reduce visual clutter.',
      'Primary quick-action toggle (Start if stopped; Stop/Restart if running) rather than displaying all possible permutations at once.',
      'Quick search bars with real-time filtering to instantly isolate target resources.',
      'One-click template presets in container creation dialog.',
    ],
  },
  {
    id: 'fitts',
    name: "Fitts's Law",
    badge: 'Target Size & Acquisition Distance',
    icon: Target,
    color: 'text-cyan-400 bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    definition:
      'The time required to rapidly move to a target area is a function of the ratio between the distance to the target and the width of the target.',
    flawInLegacy:
      'Buttons had tiny 8px padding and sat tightly crammed with 6px margins, making accidental clicks on "Remove" dangerously likely when aiming for "Stop" or "Logs".',
    implementationInApp: [
      'Touch-friendly target areas (≥40px-44px minimum hit targets) across all buttons.',
      'Full-row clickability to select and attach container logs directly.',
      'Safe visual separation and divider buffers between safe actions (Start/Restart) and high-consequence operations (Remove).',
      'Pinned, high-reachability top header controls for Reload and Quick Container Launch.',
    ],
  },
  {
    id: 'jakob',
    name: "Jakob's Law",
    badge: 'Familiar Mental Models',
    icon: Compass,
    color: 'text-indigo-400 bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    definition:
      'Users spend most of their time on other sites, meaning they prefer your site to work the same way as all the other sites they already know.',
    flawInLegacy:
      'Logs were buried at the bottom underneath images; standard Docker ID conventions, ports, and console styling were plain text without familiar dev tooling controls.',
    implementationInApp: [
      'Adopts industry-standard Docker Desktop & Kubernetes dashboard layout conventions.',
      'Universally recognized status color indicators (glowing emerald for "Up/Healthy", amber for warnings, slate/red for "Exited").',
      'Standard 12-character hexadecimal container IDs with instant 1-click clipboard copy.',
      'Terminal console complete with macOS-style window dots, syntax-colored log levels, auto-scroll lock, and download utility.',
    ],
  },
  {
    id: 'miller',
    name: "Miller's Law",
    badge: 'Information Chunking (7 ± 2)',
    icon: LayoutGrid,
    color: 'text-purple-400 bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    definition:
      'The average person can only keep 7 (plus or minus 2) items or chunks of information in their working memory.',
    flawInLegacy:
      'All container and image details were dumped in unstructured tables with unformatted hashes, dates, and overwhelming text blocks.',
    implementationInApp: [
      'Chunked 5-card metric summary bar at top level: Running, Stopped, Total Containers, Images, and Active Logs stream.',
      'Clear tabbed navigation isolating Containers, Images, and Console Logs into distinct functional workflows.',
      'Structured container card details: Name, Image tag, Exposed Ports, CPU%, and Memory usage cleanly grouped.',
    ],
  },
  {
    id: 'proximity',
    name: 'Gestalt Law of Proximity',
    badge: 'Visual Relatedness & Grouping',
    icon: Layers,
    color: 'text-blue-400 bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    definition:
      'Objects that are near each other tend to be grouped together and perceived as having a shared function or relationship.',
    flawInLegacy:
      'Controls had ambiguous spacing; logs controls and table buttons floated without visual bounding boxes or clear relationship grouping.',
    implementationInApp: [
      'Lifecycle actions (Logs, Restart, Stop/Start) unified in distinct action capsule containers.',
      'Dedicated command bar for terminal logs bringing search, auto-scroll, tail selection, and clear buttons into a single cohesive control group.',
      'Consistent mathematical spacing hierarchy where container padding (16-24px) strictly exceeds inner item gaps (8-12px).',
    ],
  },
  {
    id: 'aesthetic',
    name: 'Aesthetic-Usability Effect',
    badge: 'Perceived Usability & Trust',
    icon: Sparkles,
    color: 'text-emerald-400 bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    definition:
      'Users perceive aesthetically pleasing design as design that is more usable, forgiving of minor errors, and worthy of confidence.',
    flawInLegacy:
      'Generic dark blue styling with harsh unrounded borders, unformatted monospace text dump, and raw alert-style modal dialogs.',
    implementationInApp: [
      'Engineered with a high-contrast slate DevOps aesthetic, crisp typography (Plus Jakarta Sans + Fira Code), and glowing live status beacons.',
      'Micro-animations with smooth feedback on action triggers (copy confirmation toasts, pulse indicators, spin reload).',
      'Accessible contrast exceeding WCAG AA standards with refined color semantics.',
    ],
  },
];

export const UIPrinciplesGuide: React.FC<UIPrinciplesGuideProps> = ({ isOpen, onClose }) => {
  const [activePrincipleId, setActivePrincipleId] = useState<string>('hick');

  if (!isOpen) return null;

  const activePrinciple = PRINCIPLES.find((p) => p.id === activePrincipleId) || PRINCIPLES[0];

  return (
    <div
      id="principles-guide-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md transition-all"
      onClick={onClose}
    >
      <div
        id="principles-guide-modal-content"
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">UI Principles Architecture</h2>
                <span className="text-xs bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-800 font-mono">
                  6 Laws Applied
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Detailed breakdown of design decisions implemented in this Docker Manager
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Sidebar list + Detail view */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Navigation list */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/40 p-3 overflow-y-auto shrink-0 space-y-1">
            {PRINCIPLES.map((p) => {
              const Icon = p.icon;
              const isSelected = p.id === activePrincipleId;

              return (
                <button
                  key={p.id}
                  onClick={() => setActivePrincipleId(p.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${p.color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-xs text-slate-200 truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{p.badge}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed view */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-900">
            {/* Title & Core Concept */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${activePrinciple.color} border ${activePrinciple.borderColor}`}>
                    {activePrinciple.badge}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-100">{activePrinciple.name}</h3>
              </div>
            </div>

            {/* Definition Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Core Law Definition
              </span>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                "{activePrinciple.definition}"
              </p>
            </div>

            {/* Critique of legacy code */}
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40">
              <div className="flex items-center gap-2 mb-1.5 text-rose-300 text-xs font-bold uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Identified Issues in Legacy HTML</span>
              </div>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                {activePrinciple.flawInLegacy}
              </p>
            </div>

            {/* Implementation in this Refactored App */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
              <div className="flex items-center gap-2 mb-3 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>How This App Solves It</span>
              </div>
              <ul className="space-y-2">
                {activePrinciple.implementationInApp.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-200 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-mono">
            Docker Manager • Engineered with UX Laws
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
