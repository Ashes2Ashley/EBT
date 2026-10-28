import React, { useState } from 'react';
import { 
  X, 
  Crosshair, 
  ShieldAlert, 
  CheckCircle2, 
  Copy, 
  Check, 
  Send, 
  FileText, 
  Download, 
  Terminal, 
  Cpu, 
  AlertTriangle,
  Flame,
  Globe
} from 'lucide-react';
import { AttributionHypothesis } from '../types/osint';
import { performAttributionAnalysis } from '../utils/attributionEngine';
import { soundManager } from '../utils/audioAlert';

interface AttributionAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  contextInfo?: string;
  onDispatchAlert?: (title: string, details: string) => void;
  isAdmin: boolean;
}

export const AttributionAssistModal: React.FC<AttributionAssistModalProps> = ({
  isOpen,
  onClose,
  initialText,
  contextInfo = '',
  onDispatchAlert,
  isAdmin
}) => {
  const [analyzedText, setAnalyzedText] = useState(initialText);
  const [hypothesis, setHypothesis] = useState<AttributionHypothesis>(() => 
    performAttributionAnalysis(initialText, contextInfo)
  );
  const [copiedDossier, setCopiedDossier] = useState(false);
  const [activeCountermeasureDeployed, setActiveCountermeasureDeployed] = useState(false);

  if (!isOpen) return null;

  const handleReanalyze = () => {
    soundManager.playAlertChime('MED');
    setHypothesis(performAttributionAnalysis(analyzedText, contextInfo));
  };

  const handleCopyDossier = () => {
    const report = `[ARGUS FORENSIC ADVERSARY ATTRIBUTION DOSSIER]
PRIMARY ATTRIBUTED ACTOR: ${hypothesis.primaryActor}
CONFIDENCE LEVEL: ${hypothesis.confidenceScore}% (HIGH ASSURANCE)
DATE GENERATED: ${new Date().toISOString()}

TARGETED REGION: Georgia & Florida Critical Infrastructure Corridor

CORROBORATING FORENSIC EVIDENCE:
${hypothesis.corroboratingEvidence.map(e => `[${e.category}] (${e.weight} WEIGHT) - ${e.description}`).join('\n')}

IDENTIFIED MITRE ATT&CK TTPs:
${hypothesis.mitreTechniquesIdentified.join(', ')}

RECOMMENDED SOC PLAYBOOK ACTIONS:
${hypothesis.recommendedDefenses.map(d => `[+] ${d}`).join('\n')}

AUTHORIZED BY ARGUS AUTONOMOUS OSINT ENGINE`;

    navigator.clipboard.writeText(report);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2000);
  };

  const handleDeployCountermeasure = () => {
    soundManager.playAlertChime('HIGH');
    setActiveCountermeasureDeployed(true);
    if (onDispatchAlert) {
      onDispatchAlert(
        `EMERGENCY ATTRIBUTION DEFENSE: ${hypothesis.primaryActor} Countermeasures Deployed`,
        `Perimeter firewall scrubbing and zero-trust revocation initiated for ${hypothesis.primaryActor} targeting Georgia & Florida corridor.`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-xl border border-emerald-500/50 bg-slate-950 p-5 sm:p-6 shadow-2xl shadow-emerald-950/60 font-mono text-slate-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-950/80 border border-red-500/50 text-red-400">
              <Crosshair className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                THREAT ACTOR ATTRIBUTION ASSISTANT // OSINT FORENSIC ENGINE
              </h2>
              <p className="text-xs text-slate-400">
                Multi-dimensional correlation: Linguistic signatures, MITRE TTPs, C2 infrastructure & GA/FL targeting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Attribution Assistant"
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Text Scratchpad */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Scraped Intelligence Payload / Discussion Artifact:
            </label>
            <button
              onClick={handleReanalyze}
              className="text-emerald-400 hover:underline text-[11px]"
            >
              Re-calculate Attribution
            </button>
          </div>
          <textarea
            rows={3}
            value={analyzedText}
            onChange={(e) => setAnalyzedText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        {/* Primary Attribution Confidence Banner */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-950 border border-red-500/60 shadow-lg space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-red-400 tracking-widest block">
                PRIMARY ATTRIBUTED ADVERSARY
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                {hypothesis.primaryActor}
              </h3>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">ATTRIBUTION CONFIDENCE</span>
              <span className="text-2xl font-black text-red-400">
                {hypothesis.confidenceScore}%
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 h-full rounded-full transition-all"
              style={{ width: `${hypothesis.confidenceScore}%` }}
            />
          </div>

          {/* Secondary Suspects */}
          {hypothesis.secondarySuspects.length > 0 && (
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
              <span className="text-[10px] uppercase">Secondary Probabilities:</span>
              {hypothesis.secondarySuspects.map(s => (
                <span key={s.actorName} className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  {s.actorName} ({s.score}%)
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Corroborating Forensic Evidence Breakdown */}
        <div className="mt-4 space-y-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Corroborating Forensic Evidence & Signatures:
          </span>
          <div className="grid grid-cols-1 gap-2">
            {hypothesis.corroboratingEvidence.map((ev, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/90 text-xs flex items-start gap-2.5"
              >
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 mt-0.5 ${
                    ev.weight === 'HIGH'
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {ev.category}
                </span>
                <p className="text-slate-300 leading-snug">{ev.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* MITRE ATT&CK Mappings */}
        <div className="mt-4 p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Correlated MITRE ATT&CK Techniques:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {hypothesis.mitreTechniquesIdentified.map((ttp, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-400 font-mono"
              >
                {ttp}
              </span>
            ))}
          </div>
        </div>

        {/* Defensive Recommendations */}
        <div className="mt-4 p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Recommended Georgia & Florida Defensive Actions:
          </span>
          <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
            {hypothesis.recommendedDefenses.map((def, idx) => (
              <li key={idx}>{def}</li>
            ))}
          </ul>
        </div>

        {/* Action Controls */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCopyDossier}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition"
          >
            {copiedDossier ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedDossier ? 'Forensic Dossier Copied' : 'Export Forensic Brief'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDeployCountermeasure}
              disabled={activeCountermeasureDeployed || !isAdmin}
              title={!isAdmin ? 'Administrator clearance required' : undefined}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition ${
                activeCountermeasureDeployed
                  ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                  : isAdmin
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>
                {activeCountermeasureDeployed ? 'Countermeasures Live' : 'Deploy Adversary Countermeasure'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
