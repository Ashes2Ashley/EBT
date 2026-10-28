import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Search, 
  Filter, 
  Play, 
  Pause, 
  RefreshCw, 
  ShieldAlert, 
  Copy, 
  Check, 
  ExternalLink, 
  Flame, 
  Share2, 
  Send,
  PlusCircle,
  Tag,
  ArrowUpDown,
  TrendingUp,
  Crosshair,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { FeedItem, SourceCategory, ThreatLevel, PriorityTier } from '../types/osint';
import { analyzeThreatSentiment } from '../utils/sentiment';
import { evaluateThreatPrioritization, dynamicallyAdjustThreatPriority } from '../utils/prioritization';
import { AttributionAssistModal } from './AttributionAssistModal';
import { soundManager } from '../utils/audioAlert';

interface LiveThreatFeedProps {
  feedItems: FeedItem[];
  onAddFeedItem: (item: FeedItem) => void;
  onDispatchAlert: (item: FeedItem) => void;
  onSelectIpForInvestigation: (ip: string) => void;
  isAdmin: boolean;
}

export const LiveThreatFeed: React.FC<LiveThreatFeedProps> = ({
  feedItems,
  onAddFeedItem,
  onDispatchAlert,
  onSelectIpForInvestigation,
  isAdmin
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedPriorityTier, setSelectedPriorityTier] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'PRIORITY' | 'NEWEST' | 'SENTIMENT'>('PRIORITY');
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);
  const [copiedIoc, setCopiedIoc] = useState<string | null>(null);
  const [showManualScrapeModal, setShowManualScrapeModal] = useState(false);
  const [expandedFactorsItemId, setExpandedFactorsItemId] = useState<string | null>(null);

  // Attribution Modal State
  const [attributionModalOpen, setAttributionModalOpen] = useState(false);
  const [attributionText, setAttributionText] = useState('');
  const [attributionContext, setAttributionContext] = useState('');

  // Manual Scrape form state
  const [manualTitle, setManualTitle] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [manualSource, setManualSource] = useState('Twitter/X #threatintel');
  const [manualCategory, setManualCategory] = useState<SourceCategory>('SOCIAL_MEDIA');
  const [manualActor, setManualActor] = useState('Volt Typhoon');
  const [manualSector, setManualSector] = useState('Energy/Grid');

  // Simulated live ingestion pulse
  useEffect(() => {
    if (!isLiveActive) return;

    const interval = setInterval(() => {
      const candidatePings = [
        {
          title: 'Exploit.in Alert: Zero-Day SCADA Firmware Memory Corruption targeting Georgia Power',
          content: 'Broker offering weaponized shellcode for remote memory corruption on switchboards deployed across Georgia and Florida power utilities.',
          source: 'Exploit.in Scraper',
          cat: 'DARKWEB_FORUM' as SourceCategory,
          actor: 'Volt Typhoon',
          geo: {
            state: 'Georgia' as const,
            city: 'Waynesboro / Augusta',
            coordinates: [33.1425, -81.7633] as [number, number],
            facilityName: 'Georgia Power & Plant Vogtle Grid Nodes',
            sector: 'Energy/Grid' as const
          },
          ioc: ['198.51.100.24', 'modbus_rce_v4.py']
        },
        {
          title: 'BreachForums Dump: 420,000 Patient Billing Ledgers leaked from Florida Health Clinic',
          content: 'LockBit affiliate published unredacted archive including patient SSNs, insurance policy IDs, and medical diagnosis histories.',
          source: 'BreachForums v3',
          cat: 'DARKWEB_FORUM' as SourceCategory,
          actor: 'LockBit 3.0',
          geo: {
            state: 'Florida' as const,
            city: 'Miami',
            coordinates: [25.7617, -80.1918] as [number, number],
            facilityName: 'South Florida Medical Center',
            sector: 'Healthcare' as const
          },
          ioc: ['185.220.101.5', 'fl_health_billing_dump.7z']
        }
      ];

      const chosen = candidatePings[Math.floor(Math.random() * candidatePings.length)];
      const sentiment = analyzeThreatSentiment(chosen.title + ' ' + chosen.content);
      const prio = evaluateThreatPrioritization({
        actorName: chosen.actor,
        sector: chosen.geo.sector,
        content: chosen.title + ' ' + chosen.content,
        state: chosen.geo.state,
        city: chosen.geo.city,
        signals: { liveAttackInProgress: true, darkWebAuctionActive: true }
      });

      const newItem: FeedItem = {
        id: `feed-auto-${Date.now()}`,
        title: chosen.title,
        content: chosen.content,
        sourceName: chosen.source,
        sourceCategory: chosen.cat,
        timestamp: 'Just Now',
        threatLevel: prio.compositeScore > 85 ? 'CRITICAL' : 'HIGH',
        sentiment,
        prioritization: prio,
        targetGeo: chosen.geo,
        attributedActor: chosen.actor,
        indicatorsOfCompromise: chosen.ioc,
        verified: true
      };

      onAddFeedItem(newItem);
      soundManager.playAlertChime('MED');
    }, 32000);

    return () => clearInterval(interval);
  }, [isLiveActive, onAddFeedItem]);

  const handleCopyIoc = (ioc: string) => {
    navigator.clipboard.writeText(ioc);
    setCopiedIoc(ioc);
    setTimeout(() => setCopiedIoc(null), 2000);
  };

  const handleManualScrapeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle || !manualContent) return;

    const sentiment = analyzeThreatSentiment(manualTitle + ' ' + manualContent);
    const prio = evaluateThreatPrioritization({
      actorName: manualActor,
      sector: manualSector,
      content: manualTitle + ' ' + manualContent,
      state: manualContent.toLowerCase().includes('georgia') ? 'Georgia' : manualContent.toLowerCase().includes('florida') ? 'Florida' : 'Multi-State',
      signals: { liveAttackInProgress: true }
    });

    const newItem: FeedItem = {
      id: `manual-scrape-${Date.now()}`,
      title: manualTitle,
      content: manualContent,
      sourceName: manualSource,
      sourceCategory: manualCategory,
      timestamp: 'Just Now',
      threatLevel: prio.compositeScore >= 85 ? 'CRITICAL' : 'HIGH',
      sentiment,
      prioritization: prio,
      targetGeo: manualContent.toLowerCase().includes('georgia') ? {
        state: 'Georgia',
        city: 'Atlanta',
        coordinates: [33.7490, -84.3880],
        facilityName: 'Georgia Regional Asset',
        sector: 'Municipal/Gov'
      } : {
        state: 'Florida',
        city: 'Miami',
        coordinates: [25.7617, -80.1918],
        facilityName: 'Florida Regional Asset',
        sector: 'Healthcare'
      },
      attributedActor: manualActor,
      indicatorsOfCompromise: ['manual_ioc_' + Math.random().toString(36).substring(2, 8), '198.51.100.24'],
      verified: true
    };

    onAddFeedItem(newItem);
    soundManager.playAlertChime('HIGH');
    setShowManualScrapeModal(false);
    setManualTitle('');
    setManualContent('');
  };

  const handleOpenAttribution = (item: FeedItem) => {
    setAttributionText(item.title + '\n' + item.content);
    setAttributionContext(`${item.targetGeo?.state || ''} ${item.targetGeo?.sector || ''}`);
    setAttributionModalOpen(true);
    soundManager.playAlertChime('HIGH');
  };

  // Filter feed items
  const filteredFeed = feedItems.filter(item => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchText = (item.title + ' ' + item.content + ' ' + item.sourceName + ' ' + (item.attributedActor || '')).toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    if (selectedCategory !== 'ALL' && item.sourceCategory !== selectedCategory) return false;
    if (selectedSeverity !== 'ALL' && item.threatLevel !== selectedSeverity) return false;
    if (selectedPriorityTier !== 'ALL' && item.prioritization?.priorityTier !== selectedPriorityTier) return false;
    if (selectedRegion !== 'ALL') {
      if (selectedRegion === 'GEORGIA' && item.targetGeo?.state !== 'Georgia') return false;
      if (selectedRegion === 'FLORIDA' && item.targetGeo?.state !== 'Florida') return false;
    }
    return true;
  });

  // Sort feed items
  filteredFeed.sort((a, b) => {
    if (sortBy === 'PRIORITY') {
      const scoreA = a.prioritization?.compositeScore ?? (a.threatLevel === 'CRITICAL' ? 88 : 70);
      const scoreB = b.prioritization?.compositeScore ?? (b.threatLevel === 'CRITICAL' ? 88 : 70);
      return scoreB - scoreA;
    }
    if (sortBy === 'SENTIMENT') {
      return b.sentiment.urgency - a.sentiment.urgency;
    }
    return 0; // Newest by default insertion
  });

  return (
    <div className="space-y-4 font-mono text-slate-200">
      {/* Header Controller */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-950 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-wide">
              LIVE OSINT STREAM & DYNAMIC THREAT PRIORITIZATION
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamic weighting: Adversary reputation (25%), impact (30%), exploitability (25%), and Georgia/Florida geo focus (20%)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLiveActive(!isLiveActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
              isLiveActive
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500 text-amber-300'
            }`}
          >
            {isLiveActive ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>STREAM: LIVE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>STREAM: PAUSED</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowManualScrapeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold uppercase transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Targeted Query</span>
          </button>
        </div>
      </div>

      {/* Filter and Priority Sorting Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search keywords, actors, CVEs, GA or FL targets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Priority Tier Filter */}
        <div className="md:col-span-3">
          <select
            value={selectedPriorityTier}
            onChange={(e) => setSelectedPriorityTier(e.target.value)}
            aria-label="Filter by priority tier"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-bold"
          >
            <option value="ALL">All Priority Tiers</option>
            <option value="P1_IMMINENT_CRITICAL">P1 - Imminent Critical (Score 88-100)</option>
            <option value="P2_HIGH_ALERT">P2 - High Alert (Score 72-87)</option>
            <option value="P3_ELEVATED_WATCH">P3 - Elevated Watch (Score 52-71)</option>
          </select>
        </div>

        {/* Region filter */}
        <div className="md:col-span-2">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            aria-label="Filter by target region"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-bold"
          >
            <option value="ALL">All Regions</option>
            <option value="GEORGIA">Georgia Priority</option>
            <option value="FLORIDA">Florida Priority</option>
          </select>
        </div>

        {/* Dynamic Sort By */}
        <div className="md:col-span-3 flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">SORT:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'PRIORITY' | 'NEWEST' | 'SENTIMENT')}
            aria-label="Sort intelligence stream"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
          >
            <option value="PRIORITY">Priority Score (Highest First)</option>
            <option value="SENTIMENT">Sentiment Panic Urgency</option>
            <option value="NEWEST">Newest Ingestion</option>
          </select>
        </div>
      </div>

      {/* Stream Cards */}
      <div className="space-y-3.5">
        {filteredFeed.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-500 text-xs">
            No threat intelligence matched your active filters.
          </div>
        ) : (
          filteredFeed.map(item => {
            const prio = item.prioritization || evaluateThreatPrioritization({
              actorName: item.attributedActor,
              sector: item.targetGeo?.sector,
              content: item.title + ' ' + item.content,
              state: item.targetGeo?.state,
              city: item.targetGeo?.city
            });

            const isP1 = prio.priorityTier === 'P1_IMMINENT_CRITICAL';
            const isP2 = prio.priorityTier === 'P2_HIGH_ALERT';
            const showFactors = expandedFactorsItemId === item.id;

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-xl border bg-slate-950/95 space-y-3 transition-all shadow-xl ${
                  isP1
                    ? 'border-red-900/80 hover:border-red-500/80 shadow-red-950/20'
                    : isP2
                    ? 'border-amber-900/70 hover:border-amber-500/70'
                    : 'border-slate-800 hover:border-emerald-500/60'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Priority Tier Badge */}
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded font-black tracking-wider uppercase flex items-center gap-1 ${
                          isP1
                            ? 'bg-rose-950 text-rose-300 border border-rose-500 animate-pulse'
                            : isP2
                            ? 'bg-amber-950 text-amber-300 border border-amber-500'
                            : 'bg-sky-950 text-sky-300 border border-sky-500'
                        }`}
                      >
                        <Flame className="w-3 h-3 text-rose-400" />
                        {prio.priorityTier.replace('_', ' ')} ({prio.compositeScore}/100)
                      </span>

                      {/* Source */}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 uppercase">
                        {item.sourceName}
                      </span>

                      {/* Sentiment */}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-orange-300 font-bold">
                        PANIC {item.sentiment.urgency}%
                      </span>

                      {/* GA / FL Target Geo */}
                      {item.targetGeo && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/60 font-bold">
                          GEO: {item.targetGeo.state.toUpperCase()} ({item.targetGeo.city})
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white pt-1">
                      {item.title}
                    </h3>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                    {item.timestamp}
                  </span>
                </div>

                {/* Content */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.content}
                </p>

                {/* Priority Factor Breakdown Disclosure */}
                <div className="rounded-lg bg-slate-900/70 border border-slate-800/90 p-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-emerald-400" />
                      Prioritization Weight Breakdown:
                    </span>
                    <button
                      onClick={() => setExpandedFactorsItemId(showFactors ? null : item.id)}
                      className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5"
                    >
                      {showFactors ? 'Hide Factors' : 'View Scoring Factors'}
                      <ChevronDown className={`w-3 h-3 transition-transform ${showFactors ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {showFactors && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] animate-in fade-in-50">
                      <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">ACTOR REP (25%):</span>
                        <span className="text-white font-bold">{prio.factors.actorReputationScore} / 100</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">IMPACT (30%):</span>
                        <span className="text-rose-400 font-bold">{prio.factors.impactScore} / 100</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">EXPLOITABILITY (25%):</span>
                        <span className="text-amber-400 font-bold">{prio.factors.exploitabilityScore} / 100</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">GA/FL RELEVANCE (20%):</span>
                        <span className="text-emerald-400 font-bold">{prio.factors.geoRelevanceScore} / 100</span>
                      </div>
                      {prio.priorityReasons.length > 0 && (
                        <div className="col-span-2 sm:col-span-4 text-[10px] text-slate-400 pt-1">
                          Reasons: {prio.priorityReasons.join(' • ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer and Attribution Actions */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.attributedActor && (
                      <div className="text-[11px] text-slate-400">
                        ATTRIBUTED: <span className="text-red-400 font-bold">{item.attributedActor}</span>
                      </div>
                    )}

                    {item.indicatorsOfCompromise.map((ioc, idx) => {
                      const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ioc);
                      return (
                        <div key={idx} className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                          <code className="text-emerald-400">{ioc}</code>
                          <button
                            onClick={() => handleCopyIoc(ioc)}
                            title="Copy IOC"
                            className="text-slate-400 hover:text-white"
                          >
                            {copiedIoc === ioc ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                          {isIp && (
                            <button
                              onClick={() => onSelectIpForInvestigation(ioc)}
                              className="text-sky-400 hover:text-sky-300 text-[10px] underline ml-1"
                            >
                              Trace
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenAttribution(item)}
                      className="px-2.5 py-1 rounded bg-red-950/70 hover:bg-red-900 border border-red-500/50 text-red-200 text-xs flex items-center gap-1 transition"
                    >
                      <Crosshair className="w-3 h-3 text-red-400" />
                      <span>Attribution Assist</span>
                    </button>

                    <button
                      onClick={() => onDispatchAlert(item)}
                      className="px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500 text-emerald-400 text-xs flex items-center gap-1.5 transition"
                    >
                      <Send className="w-3 h-3" />
                      <span>Dispatch Alert</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manual Targeted Scrape Modal */}
      {showManualScrapeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-emerald-500/50 bg-slate-950 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-400" />
                Targeted OSINT Scrape & Dynamic Prioritization Ingestion
              </h3>
              <button
                onClick={() => setShowManualScrapeModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleManualScrapeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Intelligence Title / Header:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exploitation of Port of Savannah Edge Routers Confirmed"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Threat Actor Candidate:</label>
                  <select
                    value={manualActor}
                    onChange={(e) => setManualActor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Volt Typhoon">Volt Typhoon (PRC State)</option>
                    <option value="LockBit 3.0">LockBit 3.0 (Ransomware)</option>
                    <option value="Scattered Spider">Scattered Spider</option>
                    <option value="APT28">APT28 (GRU)</option>
                    <option value="BlackCat">BlackCat / ALPHV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Impact Sector:</label>
                  <select
                    value={manualSector}
                    onChange={(e) => setManualSector(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Energy/Grid">Energy / Power Grid (GA/FL)</option>
                    <option value="Maritime/Ports">Maritime / Port Terminals</option>
                    <option value="Defense">Defense / Military Base</option>
                    <option value="Healthcare">Healthcare Complex</option>
                    <option value="Aviation">Aviation Hub</option>
                    <option value="Municipal/Gov">Municipal Gov</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Scraped Intel Body / Log Text:</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste raw scraped log, dark web forum thread, or threat description here..."
                  value={manualContent}
                  onChange={(e) => setManualContent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition"
              >
                <PlusCircle className="w-4 h-4" />
                Ingest & Calculate Dynamic Priority
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Attribution Assistant Modal */}
      <AttributionAssistModal
        isOpen={attributionModalOpen}
        onClose={() => setAttributionModalOpen(false)}
        initialText={attributionText}
        contextInfo={attributionContext}
        onDispatchAlert={(title, details) => onDispatchAlert({
          id: `disp-attrib-${Date.now()}`,
          title,
          content: details,
          sourceName: 'ARGUS Attribution Engine',
          sourceCategory: 'PUBLIC_DB',
          timestamp: 'Just Now',
          threatLevel: 'CRITICAL',
          sentiment: { score: -0.9, label: 'PANIC', urgency: 95, confidence: 95, keywordsFound: ['zero-day', 'c2'] },
          indicatorsOfCompromise: [],
          verified: true
        })}
        isAdmin={isAdmin}
      />
    </div>
  );
};
