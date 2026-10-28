import React, { useState } from 'react';
import { 
  MapPin, 
  Flame, 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Sliders, 
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { CountyThreatMetric } from '../types/osint';
import { GEORGIA_FLORIDA_COUNTIES } from '../data/forensicsData';
import { soundManager } from '../utils/audioAlert';

interface CountyHeatmapProps {
  onSelectCountyForMap?: (state: string) => void;
}

export const CountyHeatmap: React.FC<CountyHeatmapProps> = ({ onSelectCountyForMap }) => {
  const [counties] = useState<CountyThreatMetric[]>(GEORGIA_FLORIDA_COUNTIES);
  const [selectedState, setSelectedState] = useState<'All' | 'Georgia' | 'Florida'>('All');
  const [searchCounty, setSearchCounty] = useState('');

  const filtered = counties.filter(c => {
    if (selectedState !== 'All' && c.state !== selectedState) return false;
    if (searchCounty && !c.countyName.toLowerCase().includes(searchCounty.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4 font-mono text-slate-200">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              COUNTY-LEVEL GEOSPATIAL THREAT DENSITY // GEORGIA & FLORIDA
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time critical infrastructure vulnerability index aggregated across high-density municipal corridors
          </p>
        </div>

        {/* State Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {(['All', 'Georgia', 'Florida'] as const).map(st => (
            <button
              key={st}
              onClick={() => {
                setSelectedState(st);
                soundManager.playAlertChime('MED');
              }}
              className={`px-3 py-1.5 rounded font-bold transition ${
                selectedState === st ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'All' ? 'ALL SECTORS' : st.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Counties */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map(c => {
          const isCrit = c.status === 'CRITICAL';
          const isElevated = c.status === 'ELEVATED';

          return (
            <div
              key={c.countyName}
              className={`p-4 rounded-xl border bg-slate-950/95 space-y-3 shadow-lg transition-all ${
                isCrit
                  ? 'border-red-900/80 hover:border-red-500'
                  : isElevated
                  ? 'border-amber-900/60 hover:border-amber-500'
                  : 'border-slate-800 hover:border-emerald-500/60'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">{c.state}</span>
                  <h3 className="font-bold text-white text-xs sm:text-sm mt-0.5">{c.countyName}</h3>
                </div>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                    isCrit
                      ? 'bg-red-950 text-red-300 border border-red-500/80 animate-pulse'
                      : isElevated
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/60'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                  }`}
                >
                  {c.status}
                </span>
              </div>

              {/* Threat Index Meter */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">THREAT INDEX:</span>
                  <span className={`font-bold ${isCrit ? 'text-red-400' : 'text-amber-400'}`}>
                    {c.threatIndex} / 100
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isCrit ? 'bg-red-500' : isElevated ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${c.threatIndex}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">KEY ASSETS:</span>
                  <span className="text-white font-bold">{c.criticalAssetCount} Facilities</span>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">INTRUSIONS:</span>
                  <span className={`font-bold ${c.activeAttacks > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {c.activeAttacks} Active
                  </span>
                </div>
              </div>

              {onSelectCountyForMap && (
                <button
                  onClick={() => onSelectCountyForMap(c.state)}
                  className="w-full py-1.5 px-3 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500 text-slate-300 hover:text-white text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <span>Focus in Tactical Radar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
