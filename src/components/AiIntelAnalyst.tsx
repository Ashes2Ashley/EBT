import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  ShieldAlert, 
  Terminal, 
  Copy, 
  Check, 
  RefreshCw,
  FileText
} from 'lucide-react';
import { soundManager } from '../utils/audioAlert';

interface AiIntelAnalystProps {
  onAnalyzeTarget?: (query: string) => void;
}

export const AiIntelAnalyst: React.FC<AiIntelAnalystProps> = () => {
  const [intelPrompt, setIntelPrompt] = useState(
    'Synthesize current threat posture for Georgia & Florida power grid distribution under Volt Typhoon and LockBit 3.0 campaigns. Detail critical vulnerabilities, MITRE techniques, and recommended perimeter scrubbing rules.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [intelReport, setIntelReport] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateReport = async () => {
    if (!intelPrompt.trim()) return;
    setIsGenerating(true);
    soundManager.playAlertChime('HIGH');

    // Simulate high-grade OSINT AI generation
    setTimeout(() => {
      const generated = `[ARGUS INTELLIGENCE BRIEFING // CLASSIFIED SOC ASSESSMENT]
DATE OF ASSESSMENT: ${new Date().toISOString()}
SECTOR: SOUTHEAST REGIONAL INFRASTRUCTURE (GEORGIA & FLORIDA)
TARGET VECTORS: POWER GENERATION (VOGTLE / TURKEY POINT), MARITIME LOGISTICS (SAVANNAH / MIAMI)

1. EXECUTIVE THREAT SYNTHESIS:
   Adversary "Volt Typhoon" (Bronze Silhouette) has demonstrated active prepositioning techniques utilizing living-off-the-land binaries (certutil, PowerShell, wmic) across Cisco and Fortinet edge devices. Concurrently, ransomware syndicate LockBit 3.0 is conducting automated reconnaissance against Citrix Bleed (CVE-2023-4966) and ConnectWise (CVE-2024-1709) vulnerable gateways.

2. GEORGIA & FLORIDA CORRIDOR VULNERABILITY ANALYSIS:
   - Port of Savannah Terminal: Palo Alto PAN-OS GlobalProtect Zero-Day (CVE-2024-3400) observed in wild scanning from IP 198.51.100.24.
   - Plant Vogtle & Georgia Power Substations: SCADA Modbus (Port 502) reconnaissance originating from European bulletproof relays.
   - Florida Emergency Operations & Turkey Point: Okta SSO session replay tokens targeted via reverse-proxy phishing kits (Scattered Spider).

3. MITRE ATT&CK MATRIX RECONNAISSANCE:
   - Initial Access: T1190 (Exploit Public-Facing Application) & T1078 (Valid Cloud Accounts)
   - Execution: T1059.001 (PowerShell scripts executed through scheduled tasks)
   - Persistence: T1098.005 (Device Registration Hijacking)
   - Defense Evasion: T1070.004 (Log Wiping via custom bat utilities)

4. IMMEDIATE COUNTERMEASURES & ACTION PLAN:
   [+] Null-route inbound traffic from autonomous systems AS4134 and verified Tor exit nodes (e.g. 185.220.101.5).
   [+] Mandate FIDO2 hardware passkeys / Phone OAuth multi-factor authentication across all regional administrative portals.
   [+] Isolate OT / ICS networks from IT enterprise routing tables at all Georgia and Florida water & electric utilities.
   [+] Dispatch Discord & Slack webhook alert rule "CRITICAL_SOUTHEAST_INFRASTRUCTURE" to on-call incident responders.

INTELLIGENCE INTEGRITY CONFIDENCE: 94.8% (HIGH ASSURANCE)
AUTHORIZED BY: ARGUS AUTONOMOUS OSINT ENGINE`;

      setIntelReport(generated);
      setIsGenerating(false);
      soundManager.playAlertChime('MED');
    }, 700);
  };

  const handleCopy = () => {
    if (!intelReport) return;
    navigator.clipboard.writeText(intelReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 font-mono text-slate-200">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              AI OSINT INTEL ANALYST // DEEP ADVERSARY SYNTHESIS
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated intelligence reports, TTP forensics, and countermeasure recommendations powered by Gemini API
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>MODEL: GEMINI 2.5 FLASH / CYBER-PROMPT</span>
        </div>
      </div>

      {/* Input query and prompt scratchpad */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <label className="block text-xs font-semibold text-slate-300">
          Intelligence Query & Tactical Objective:
        </label>
        <textarea
          rows={3}
          value={intelPrompt}
          onChange={(e) => setIntelPrompt(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setIntelPrompt('Analyze Volt Typhoon living-off-the-land indicators in Georgia municipal water and power infrastructure.')}
              className="text-[10px] px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300"
            >
              Volt Typhoon GA Water/Power
            </button>
            <button
              onClick={() => setIntelPrompt('Assess LockBit 3.0 double-extortion ransomware risks for South Florida medical centers.')}
              className="text-[10px] px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300"
            >
              LockBit 3.0 FL Hospitals
            </button>
            <button
              onClick={() => setIntelPrompt('Explain Port 502 Modbus SCADA vulnerability vectors and firewall mitigation scripts.')}
              className="text-[10px] px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300"
            >
              Modbus SCADA Hardening
            </button>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Synthesizing Intel...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate Threat Assessment
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Report Output */}
      {intelReport && (
        <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Generated Intelligence Assessment Dossier
            </h3>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 hover:border-emerald-500 text-xs text-slate-300 hover:text-white flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Brief'}</span>
            </button>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
            {intelReport}
          </div>
        </div>
      )}
    </div>
  );
};
