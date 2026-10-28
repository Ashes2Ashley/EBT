import React, { useState } from 'react';
import { 
  GlobeLock, 
  Skull, 
  Terminal, 
  FileText, 
  ShieldAlert, 
  ExternalLink, 
  Flame, 
  Crosshair, 
  Clock, 
  Hash, 
  UserCheck, 
  AlertTriangle,
  Search,
  Filter,
  DollarSign,
  ShieldCheck,
  Zap,
  Play,
  Pause,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { ThreatActor, FeedItem, DarkWebForumThread } from '../types/osint';
import { THREAT_ACTORS } from '../data/seedData';
import { SPECIALIZED_DARKWEB_THREADS } from '../data/darkWebData';
import { AttributionAssistModal } from './AttributionAssistModal';
import { soundManager } from '../utils/audioAlert';

interface DarkWebAttributionProps {
  feedItems: FeedItem[];
  onSelectIpForInvestigation: (ip: string) => void;
  onDispatchAlert: (title: string, details: string) => void;
  isAdmin: boolean;
}

export const DarkWebAttribution: React.FC<DarkWebAttributionProps> = ({
  feedItems,
  onSelectIpForInvestigation,
  onDispatchAlert,
  isAdmin
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'FORUMS_MARKETS' | 'ACTOR_DOSSIERS'>('FORUMS_MARKETS');
  const [threads, setThreads] = useState<DarkWebForumThread[]>(SPECIALIZED_DARKWEB_THREADS);
  const [selectedActor, setSelectedActor] = useState<ThreatActor>(THREAT_ACTORS[0]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForum, setSelectedForum] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [prioritizeGaFlOnly, setPrioritizeGaFlOnly] = useState<boolean>(true);
  
  // Scraper status
  const [isScraperRunning, setIsScraperRunning] = useState<boolean>(true);

  // Attribution Modal State
  const [attributionModalOpen, setAttributionModalOpen] = useState(false);
  const [attributionTargetText, setAttributionTargetText] = useState('');
  const [attributionContext, setAttributionContext] = useState('');

  const handleOpenAttribution = (text: string, context: string) => {
    setAttributionTargetText(text);
    setAttributionContext(context);
    setAttributionModalOpen(true);
    soundManager.playAlertChime('HIGH');
  };

  const filteredThreads = threads.filter(thread => {
    if (prioritizeGaFlOnly && !thread.relevantToSoutheast) return false;
    if (selectedForum !== 'ALL' && thread.forumName !== selectedForum) return false;
    if (selectedCategory !== 'ALL' && thread.threadCategory !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = (thread.title + ' ' + thread.rawPostText + ' ' + thread.authorHandle + ' ' + thread.targetSector).toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  const forumsList = [
    'ALL',
    'BreachForums v3',
    'Exploit.in',
    'XSS.is',
    'Russian Market',
    'Genesis Store clone',
    'LockBit 3.0 DLS'
  ];

  const categoriesList = [
    { id: 'ALL', label: 'All Underground Categories' },
    { id: '0-DAY_EXPLOIT', label: '0-Day Exploits' },
    { id: 'STOLEN_DATA', label: 'Stolen Data & DBs' },
    { id: 'INITIAL_ACCESS', label: 'Initial Access (IAB)' },
    { id: 'BOT_STEALER_LOGS', label: 'Bot Stealer Logs' },
    { id: 'RANSOMWARE_AUCTION', label: 'Ransomware Extortion' }
  ];

  return (
    <div className="space-y-4 font-mono text-slate-200">
      {/* Top Header */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-950 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <GlobeLock className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-wide">
              DEEP DARK WEB SURVEILLANCE & SPECIALIZED UNDERGROUND FORUMS
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time scraping of Exploit.in, BreachForums, XSS.is, Russian Market, and Ransomware DLS with Southeast threat priority
          </p>
        </div>

        {/* Tab & Scraper Status */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScraperRunning(!isScraperRunning)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
              isScraperRunning
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                : 'bg-amber-950/80 border-amber-500 text-amber-300'
            }`}
          >
            {isScraperRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>TOR SCRAPERS: ACTIVE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>SCRAPERS: PAUSED</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveSubTab('FORUMS_MARKETS')}
              className={`px-3 py-1.5 rounded font-bold transition ${
                activeSubTab === 'FORUMS_MARKETS'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              FORUMS & MARKETPLACES ({threads.length})
            </button>
            <button
              onClick={() => setActiveSubTab('ACTOR_DOSSIERS')}
              className={`px-3 py-1.5 rounded font-bold transition ${
                activeSubTab === 'ACTOR_DOSSIERS'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              THREAT ACTORS ({THREAT_ACTORS.length})
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'FORUMS_MARKETS' ? (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
            {/* Search */}
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search forum threads, authors, exploits, or GA/FL targets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Forum selector */}
            <div className="md:col-span-3">
              <select
                value={selectedForum}
                onChange={(e) => setSelectedForum(e.target.value)}
                aria-label="Filter by underground forum"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                {forumsList.map(f => (
                  <option key={f} value={f}>
                    {f === 'ALL' ? 'All Underground Hubs' : f}
                  </option>
                ))}
              </select>
            </div>

            {/* Category selector */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by dark web category"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                {categoriesList.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Georgia & Florida Priority Toggle */}
            <div className="md:col-span-2 flex items-center">
              <button
                onClick={() => setPrioritizeGaFlOnly(!prioritizeGaFlOnly)}
                className={`w-full py-2 px-2.5 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  prioritizeGaFlOnly
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
                <span>{prioritizeGaFlOnly ? 'GA & FL ONLY' : 'ALL REGIONS'}</span>
              </button>
            </div>
          </div>

          {/* Forum Threads & Marketplace Listings */}
          <div className="space-y-3.5">
            {filteredThreads.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-500 text-xs">
                No underground threads matched your filters. Adjust search query or disable the Georgia & Florida filter.
              </div>
            ) : (
              filteredThreads.map(thread => {
                const isCritical = thread.threatLevel === 'CRITICAL';
                const prio = thread.prioritization;

                return (
                  <div
                    key={thread.id}
                    className={`p-4 sm:p-5 rounded-xl border bg-slate-950/95 space-y-3.5 transition-all shadow-xl ${
                      isCritical
                        ? 'border-red-900/80 hover:border-red-500/80 shadow-red-950/20'
                        : 'border-slate-800 hover:border-emerald-500/60'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 border-b border-slate-800 pb-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold uppercase">
                            {thread.forumName}
                          </span>

                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              thread.threadCategory === '0-DAY_EXPLOIT'
                                ? 'bg-red-950 text-red-300 border border-red-500 animate-pulse'
                                : thread.threadCategory === 'INITIAL_ACCESS'
                                ? 'bg-amber-950 text-amber-300 border border-amber-500'
                                : 'bg-slate-900 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {thread.threadCategory.replace('_', ' ')}
                          </span>

                          {/* Dynamic Priority Score Pill */}
                          {prio && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1 ${
                                prio.priorityTier === 'P1_IMMINENT_CRITICAL'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-500'
                                  : 'bg-amber-950 text-amber-300 border border-amber-500'
                              }`}
                            >
                              <Flame className="w-3 h-3 text-rose-400" />
                              PRIORITY: {prio.priorityTier.replace('_', ' ')} ({prio.compositeScore}/100)
                            </span>
                          )}

                          {thread.relevantToSoutheast && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/60 font-bold">
                              GA & FL THREAT: {thread.targetRegion.toUpperCase()}
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-white pt-1">
                          {thread.title}
                        </h3>
                      </div>

                      <div className="text-right text-xs shrink-0">
                        <span className="text-slate-400 block text-[11px] font-mono">{thread.timestamp}</span>
                        <span className="text-emerald-400 font-bold text-xs">{thread.price}</span>
                      </div>
                    </div>

                    {/* Author & Escrow info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <div>
                        AUTHOR: <strong className="text-white">{thread.authorHandle}</strong>
                        <span className="text-slate-400 ml-2">({thread.authorReputation})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          ESCROW: {thread.escrowStatus.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          SECTOR: {thread.targetSector}
                        </span>
                      </div>
                    </div>

                    {/* Raw Scraped Post text */}
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                      {thread.rawPostText}
                    </div>

                    {/* Redacted Proof Sample */}
                    {thread.redactedProofSample && (
                      <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800 text-[11px] font-mono text-emerald-400/90 overflow-x-auto">
                        <div className="text-[10px] text-slate-500 mb-1 uppercase font-bold">
                          [ATTACHED REDACTED SAMPLE PROOF]:
                        </div>
                        <pre>{thread.redactedProofSample}</pre>
                      </div>
                    )}

                    {/* Footer Actions & Assisted Attribution */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        {thread.indicators.map((ind, idx) => {
                          const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ind);
                          return (
                            <span
                              key={idx}
                              className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-red-300 font-mono flex items-center gap-1.5"
                            >
                              <code>{ind}</code>
                              {isIp && (
                                <button
                                  onClick={() => onSelectIpForInvestigation(ind)}
                                  className="text-sky-400 underline text-[10px]"
                                >
                                  Trace
                                </button>
                              )}
                            </span>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Attribution Assistant Trigger */}
                        <button
                          onClick={() => handleOpenAttribution(thread.title + '\n' + thread.rawPostText, `${thread.targetRegion} ${thread.targetSector}`)}
                          className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/70 text-red-200 font-bold text-xs flex items-center gap-1.5 transition"
                        >
                          <Crosshair className="w-3.5 h-3.5 text-red-400" />
                          <span>Adversary Attribution Assist</span>
                          {thread.attributedActorCandidate && (
                            <span className="text-[10px] text-red-300 font-mono font-normal">
                              ({thread.attributedActorCandidate})
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => onDispatchAlert(`DARK WEB ESCALATION: ${thread.title}`, thread.rawPostText)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Dispatch Alert</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Threat Actor Dossiers View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Skull className="w-3.5 h-3.5 text-red-400" /> Tracked Threat Adversaries:
            </div>
            {THREAT_ACTORS.map(actor => {
              const isSelected = selectedActor.id === actor.id;
              return (
                <button
                  key={actor.id}
                  onClick={() => {
                    setSelectedActor(actor);
                    soundManager.playAlertChime('MED');
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm">{actor.name}</h4>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800">
                        SCORE: {actor.threatScore}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[220px]">
                      {actor.origin}
                    </p>
                  </div>
                  <div className="text-right text-[10px] text-slate-500">
                    <span>{actor.motivation}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-8 rounded-xl bg-slate-950 border border-slate-800 p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{selectedActor.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-red-950 border border-red-500/70 text-red-300 font-bold uppercase">
                    CONFIDENCE: {selectedActor.confidence}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  KNOWN ALIASES: {selectedActor.aliases.join(' • ')}
                </p>
              </div>

              <div className="text-right text-xs">
                <span className="text-slate-500 block text-[10px]">ORIGIN JURISDICTION:</span>
                <span className="text-emerald-400 font-semibold">{selectedActor.origin}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-red-950/30 border border-red-900/50 text-xs space-y-1">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-red-400" /> ACTIVE SOUTHEAST CAMPAIGN:
              </span>
              <p className="text-slate-200 leading-relaxed">{selectedActor.activeCampaigns}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Targeted Industry Sectors:
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedActor.targetSectors.map((sec, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      {sec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Regional Focus:
                </span>
                <div className="flex flex-wrap gap-1">
                  {selectedActor.targetedRegions.map((reg, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-semibold">
                      {reg}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" /> MAPPED MITRE ATT&CK TTPs:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                {selectedActor.mitreTechniques.map((ttp, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950 p-1.5 rounded border border-slate-800 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>{ttp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Associated Weapons & Payloads:
              </span>
              <p className="text-slate-300 font-mono">
                {selectedActor.knownRansomware.join(' • ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Attribution Assistant Modal */}
      <AttributionAssistModal
        isOpen={attributionModalOpen}
        onClose={() => setAttributionModalOpen(false)}
        initialText={attributionTargetText}
        contextInfo={attributionContext}
        onDispatchAlert={onDispatchAlert}
        isAdmin={isAdmin}
      />
    </div>
  );
};
