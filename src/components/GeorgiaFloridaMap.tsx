import React, { useState } from 'react';
import { 
  MapPin, 
  ShieldAlert, 
  ShieldCheck, 
  Radio, 
  Flame, 
  Crosshair, 
  Sliders, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  LocateFixed
} from 'lucide-react';
import { MapAsset } from '../types/osint';
import { soundManager } from '../utils/audioAlert';

interface GeorgiaFloridaMapProps {
  assets: MapAsset[];
  onSelectIpForInvestigation?: (ip: string) => void;
  onOpenPhoneAuth?: () => void;
  isAdmin: boolean;
}

export const GeorgiaFloridaMap: React.FC<GeorgiaFloridaMapProps> = ({
  assets,
  onSelectIpForInvestigation,
  onOpenPhoneAuth,
  isAdmin
}) => {
  const [selectedState, setSelectedState] = useState<'All' | 'Georgia' | 'Florida'>('All');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedAsset, setSelectedAsset] = useState<MapAsset | null>(assets[0] || null);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [radarActive, setRadarActive] = useState<boolean>(true);
  const [mitigationLog, setMitigationLog] = useState<string[]>([]);

  // Bounding box for GA + FL:
  // Lat: 24.5 (Key West) to 35.2 (North GA border)
  // Lng: -88.0 (Florida Panhandle / GA west) to -79.8 (Atlantic Ocean east of FL/GA)
  const MIN_LAT = 24.2;
  const MAX_LAT = 35.3;
  const MIN_LNG = -87.8;
  const MAX_LNG = -80.0;

  // Convert lat/lng to SVG viewBox coordinates [1000 x 900]
  const projectCoords = (lat: number, lng: number): [number, number] => {
    const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 960 + 20;
    const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * 840 + 30;
    return [Math.round(x), Math.round(y)];
  };

  const filteredAssets = assets.filter(asset => {
    if (selectedState !== 'All' && asset.state !== selectedState) return false;
    if (selectedSector !== 'All' && asset.sector !== selectedSector) return false;
    return true;
  });

  const handleMitigateAsset = (assetId: string) => {
    soundManager.playAlertChime('HIGH');
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    const entry = `[${new Date().toLocaleTimeString()}] EMERGENCY COUNTERMEASURE applied to ${asset.name} (${asset.city}, ${asset.state}). Inbound threat vector null-routed.`;
    setMitigationLog(prev => [entry, ...prev.slice(0, 4)]);
  };

  const sectors = ['All', 'Energy/Grid', 'Maritime/Ports', 'Defense', 'Healthcare', 'Aviation', 'Municipal/Gov'];

  return (
    <div className="space-y-4 font-mono text-slate-200">
      {/* Tactical Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-emerald-950">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wider flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-emerald-400" />
              SOUTHEAST CYBER COMMAND // GEORGIA & FLORIDA GEOSPATIAL RADAR
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time critical infrastructure vector tracking, SCADA perimeters, and active overseas intrusions
          </p>
        </div>

        {/* State Selection Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['All', 'Georgia', 'Florida'] as const).map(st => (
            <button
              key={st}
              onClick={() => {
                setSelectedState(st);
                soundManager.playAlertChime('MED');
              }}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                selectedState === st
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {st === 'All' ? 'ALL SECTOR' : st.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map & Threat Telemetry Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* SVG Tactical Map Surface (8 Cols on Desktop) */}
        <div className="lg:col-span-8 relative rounded-xl border border-emerald-500/30 bg-slate-950/95 p-3 overflow-hidden shadow-2xl">
          {/* Tactical Map Header Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/80 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                <Sliders className="w-3 h-3 text-emerald-400" /> SECTOR:
              </span>
              {sectors.map(sec => (
                <button
                  key={sec}
                  onClick={() => setSelectedSector(sec)}
                  className={`text-[10px] px-2 py-0.5 rounded transition ${
                    selectedSector === sec
                      ? 'bg-emerald-950 border border-emerald-500/80 text-emerald-300 font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowVectors(!showVectors)}
                className={`text-[10px] px-2 py-0.5 rounded border transition ${
                  showVectors
                    ? 'bg-red-950/70 border-red-500/50 text-red-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                {showVectors ? 'VECTORS: ACTIVE' : 'VECTORS: OFF'}
              </button>
              <button
                onClick={() => setRadarActive(!radarActive)}
                className={`text-[10px] px-2 py-0.5 rounded border transition ${
                  radarActive
                    ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                {radarActive ? 'RADAR: SWEEP' : 'RADAR: IDLE'}
              </button>
            </div>
          </div>

          {/* Interactive SVG Canvas */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-slate-950 rounded-lg border border-slate-900 overflow-hidden">
            <svg
              viewBox="0 0 1000 900"
              className="w-full h-full select-none"
              style={{ background: '#05080e' }}
            >
              <defs>
                {/* Grid pattern */}
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(16, 185, 129, 0.05)" strokeWidth="1" />
                </pattern>

                {/* Radar sweep gradient */}
                <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(16, 185, 129, 0.25)" />
                  <stop offset="70%" stopColor="rgba(16, 185, 129, 0.05)" />
                  <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
                </radialGradient>

                {/* Threat vector gradient */}
                <linearGradient id="threatVectorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                  <stop offset="70%" stopColor="#f43f5e" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ff0055" stopOpacity="1" />
                </linearGradient>

                {/* Pulsing beacon glow */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="glow" />
                  <feComposite in="SourceGraphic" in2="glow" operator="over" />
                </filter>
              </defs>

              {/* Grid Background */}
              <rect width="1000" height="900" fill="url(#grid)" />

              {/* Tactical Lat/Long coordinate reference lines */}
              <g stroke="rgba(51, 65, 85, 0.3)" strokeDasharray="3 3">
                <line x1="0" y1="200" x2="1000" y2="200" />
                <line x1="0" y1="400" x2="1000" y2="400" />
                <line x1="0" y1="600" x2="1000" y2="600" />
                <line x1="0" y1="800" x2="1000" y2="800" />
                <line x1="250" y1="0" x2="250" y2="900" />
                <line x1="500" y1="0" x2="500" y2="900" />
                <line x1="750" y1="0" x2="750" y2="900" />
              </g>

              {/* Lat/Long Labels */}
              <text x="15" y="205" fill="#475569" fontSize="9" fontFamily="monospace">33°N (ATLANTA/AUGUSTA CORRIDOR)</text>
              <text x="15" y="405" fill="#475569" fontSize="9" fontFamily="monospace">30°N (GA/FL STATE BORDER)</text>
              <text x="15" y="605" fill="#475569" fontSize="9" fontFamily="monospace">28°N (ORLANDO/TAMPA)</text>
              <text x="15" y="805" fill="#475569" fontSize="9" fontFamily="monospace">25°N (MIAMI/KEYS STRAIT)</text>
              <text x="760" y="25" fill="#475569" fontSize="9" fontFamily="monospace">81°W ATLANTIC</text>
              <text x="260" y="25" fill="#475569" fontSize="9" fontFamily="monospace">85°W GULF OF MEXICO</text>

              {/* Georgia State Tactical Vector Outline (Custom precise SVG path) */}
              <path
                d="M 330 30 
                   L 730 30 
                   L 760 170 
                   L 840 375 
                   L 800 440 
                   L 460 440 
                   L 460 420 
                   L 330 220 
                   Z"
                fill="rgba(16, 185, 129, 0.04)"
                stroke="rgba(16, 185, 129, 0.4)"
                strokeWidth="2"
                strokeDasharray="4 2"
              />

              {/* Florida State Tactical Vector Outline (Peninsula & Panhandle) */}
              <path
                d="M 60 410 
                   L 460 420 
                   L 800 440 
                   L 820 480 
                   L 865 590 
                   L 890 730 
                   L 895 780 
                   L 880 820 
                   L 850 850 
                   L 820 840 
                   L 780 770 
                   L 720 670 
                   L 660 630 
                   L 600 500 
                   L 460 460 
                   L 60 460 
                   Z"
                fill="rgba(14, 165, 233, 0.04)"
                stroke="rgba(14, 165, 233, 0.45)"
                strokeWidth="2"
                strokeDasharray="4 2"
              />

              {/* State Regional Watermarks */}
              <text x="520" y="220" fill="rgba(16, 185, 129, 0.15)" fontSize="32" fontWeight="bold" fontFamily="monospace" letterSpacing="4">
                GEORGIA
              </text>
              <text x="710" y="650" fill="rgba(14, 165, 233, 0.15)" fontSize="32" fontWeight="bold" fontFamily="monospace" letterSpacing="4">
                FLORIDA
              </text>

              {/* Simulated Overseas Threat Inbound Attack Arcs */}
              {showVectors && filteredAssets.map((asset) => {
                if (!asset.incomingVector) return null;
                const [targetX, targetY] = projectCoords(asset.coordinates[0], asset.coordinates[1]);
                
                // Deterministic foreign origin offset points in international airspace
                const isWestOrigin = asset.incomingVector.originCountry.includes('China') || asset.incomingVector.originCountry.includes('Iran');
                const originX = isWestOrigin ? 20 : 980;
                const originY = (targetY * 0.6) + 40;
                const controlX = (originX + targetX) / 2;
                const controlY = Math.min(originY, targetY) - 90;

                return (
                  <g key={`vector-${asset.id}`}>
                    <path
                      d={`M ${originX} ${originY} Q ${controlX} ${controlY} ${targetX} ${targetY}`}
                      fill="none"
                      stroke="url(#threatVectorGrad)"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                      className="animate-pulse"
                    />
                    {/* Origin label */}
                    <circle cx={originX} cy={originY} r="4" fill="#ef4444" />
                    <text
                      x={isWestOrigin ? originX + 8 : originX - 8}
                      y={originY + 4}
                      fill="#f87171"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor={isWestOrigin ? 'start' : 'end'}
                    >
                      [THREAT ORIGIN: {asset.incomingVector.originCountry.toUpperCase()}]
                    </text>
                  </g>
                );
              })}

              {/* Radar Rotating Sweep Overlay */}
              {radarActive && (
                <g transform="translate(560, 480)" className="pointer-events-none">
                  <circle r="360" fill="none" stroke="rgba(16, 185, 129, 0.12)" strokeWidth="1" />
                  <circle r="240" fill="none" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="1" />
                  <circle r="120" fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
                  {/* Rotating beam line */}
                  <g className="radar-sweep">
                    <line x1="0" y1="0" x2="360" y2="0" stroke="rgba(52, 211, 153, 0.7)" strokeWidth="2" />
                    <path d="M 0 0 L 360 0 A 360 360 0 0 0 311 -180 Z" fill="url(#radarGlow)" opacity="0.6" />
                  </g>
                </g>
              )}

              {/* Critical Infrastructure Asset Nodes */}
              {filteredAssets.map((asset) => {
                const [cx, cy] = projectCoords(asset.coordinates[0], asset.coordinates[1]);
                const isSelected = selectedAsset?.id === asset.id;
                const isAttacked = asset.currentStatus === 'UNDER_ATTACK';
                const isMitigating = asset.currentStatus === 'MITIGATING';
                const isProbing = asset.currentStatus === 'PROBING_DETECTED';

                const markerColor = isAttacked ? '#ef4444' : isMitigating ? '#f59e0b' : isProbing ? '#38bdf8' : '#10b981';

                return (
                  <g
                    key={asset.id}
                    onClick={() => {
                      setSelectedAsset(asset);
                      soundManager.playAlertChime(isAttacked ? 'CRITICAL' : 'MED');
                    }}
                    className="cursor-pointer transition-transform hover:scale-110"
                    role="button"
                    tabIndex={0}
                    aria-label={`Inspect ${asset.name}`}
                  >
                    {/* Pulsing ring if under attack */}
                    {isAttacked && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="20"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        opacity="0.75"
                        className="animate-ping"
                      />
                    )}

                    {/* Outer target bracket */}
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="16"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    )}

                    {/* Main Node Point */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 8 : 6}
                      fill={markerColor}
                      stroke="#05080e"
                      strokeWidth="2"
                      filter="url(#glow)"
                    />

                    {/* Node label */}
                    <text
                      x={cx + 12}
                      y={cy + 4}
                      fill={isSelected ? '#ffffff' : '#cbd5e1'}
                      fontSize={isSelected ? '11' : '10'}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fontFamily="monospace"
                      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.9))"
                    >
                      {asset.city.split('/')[0].toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Map Legend & Sector Stats */}
            <div className="absolute bottom-2 left-2 bg-slate-950/90 border border-slate-800 p-2 rounded text-[10px] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                <span>UNDER ATTACK ({filteredAssets.filter(a => a.currentStatus === 'UNDER_ATTACK').length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>MITIGATING ({filteredAssets.filter(a => a.currentStatus === 'MITIGATING').length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                <span>PROBING DETECTED ({filteredAssets.filter(a => a.currentStatus === 'PROBING_DETECTED').length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>PERIMETER SECURE ({filteredAssets.filter(a => a.currentStatus === 'SECURE').length})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Asset Deep Triage Panel (4 Cols on Desktop) */}
        <div className="lg:col-span-4 space-y-3">
          {selectedAsset ? (
            <div className="rounded-xl border border-emerald-500/40 bg-slate-950/95 p-4 space-y-3 shadow-xl">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{selectedAsset.city}, {selectedAsset.state.toUpperCase()}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">
                    {selectedAsset.name}
                  </h3>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    selectedAsset.currentStatus === 'UNDER_ATTACK'
                      ? 'bg-red-950 text-red-300 border border-red-500/70'
                      : selectedAsset.currentStatus === 'MITIGATING'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/60'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/60'
                  }`}
                >
                  {selectedAsset.currentStatus.replace('_', ' ')}
                </span>
              </div>

              {/* Asset telemetry metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">SECTOR:</span>
                  <span className="text-white font-semibold">{selectedAsset.sector}</span>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">ACTIVE THREATS:</span>
                  <span className="text-red-400 font-bold">{selectedAsset.activeThreatCount} Intrusions</span>
                </div>
              </div>

              {/* Impacted CVE or Vulnerability */}
              {selectedAsset.cveImpacted && (
                <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" /> VULNERABILITY CVE MATCH:
                  </span>
                  <p className="text-slate-300 font-mono text-[11px]">{selectedAsset.cveImpacted}</p>
                </div>
              )}

              {/* Inbound Attack Vector Details */}
              {selectedAsset.incomingVector ? (
                <div className="p-2.5 rounded bg-red-950/40 border border-red-500/40 text-xs space-y-1">
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-red-400" /> INBOUND ACTIVE VECTOR:
                  </span>
                  <p className="text-slate-200 text-[11px]">
                    <span className="text-red-300 font-semibold">{selectedAsset.incomingVector.actor}</span> ({selectedAsset.incomingVector.originCountry})
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Vector: {selectedAsset.incomingVector.vectorType}
                  </p>
                </div>
              ) : (
                <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/30 text-xs flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>No active high-severity vector breach recorded</span>
                </div>
              )}

              {/* Coordinates display */}
              <div className="text-[11px] text-slate-400 font-mono">
                COORDINATES: {selectedAsset.coordinates[0].toFixed(4)}°N, {selectedAsset.coordinates[1].toFixed(4)}°W
              </div>

              {/* Admin Actions */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => handleMitigateAsset(selectedAsset.id)}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Deploy Perimeter Scrubbing Rule
                </button>

                {onSelectIpForInvestigation && (
                  <button
                    onClick={() => onSelectIpForInvestigation('198.51.100.24')}
                    className="w-full py-1.5 px-3 rounded border border-slate-700 hover:border-emerald-500 text-slate-300 hover:text-white text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <LocateFixed className="w-3.5 h-3.5 text-emerald-400" />
                    Deep Trace Inbound IP in Finder
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-950 text-center text-slate-500 text-xs">
              Select any asset on the map to inspect telemetry
            </div>
          )}

          {/* Real-Time Mitigation Audit Log */}
          {mitigationLog.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400" /> Mitigations Applied:
              </span>
              <div className="space-y-1 text-[10px] text-emerald-400 font-mono">
                {mitigationLog.map((log, i) => (
                  <p key={i} className="truncate">{log}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
