import React, { useState } from 'react';
import { 
  Activity, 
  Flame, 
  AlertOctagon, 
  TrendingUp, 
  Gauge, 
  Sliders, 
  CheckCircle2,
  Sparkles,
  Zap,
  Tag
} from 'lucide-react';
import { FeedItem } from '../types/osint';
import { analyzeThreatSentiment, calculateFleetThreatSummary } from '../utils/sentiment';

interface SentimentAnalyticsProps {
  feedItems: FeedItem[];
}

export const SentimentAnalytics: React.FC<SentimentAnalyticsProps> = ({ feedItems }) => {
  const [testText, setTestText] = useState(
    'URGENT: Imminent ransomware leak threatening Georgia power distribution SCADA nodes with catastrophic zero-day exploit.'
  );
  const [testResult, setTestResult] = useState(() => analyzeThreatSentiment(testText));

  const fleetSummary = calculateFleetThreatSummary(feedItems);

  const handleRunTest = () => {
    setTestResult(analyzeThreatSentiment(testText));
  };

  // Keyword frequency aggregation
  const keywordCounts: Record<string, number> = {};
  for (const item of feedItems) {
    for (const kw of item.sentiment.keywordsFound) {
      keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
    }
  }
  const sortedKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="space-y-4 font-mono text-slate-200">
      {/* Top Overview Banner */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              REAL-TIME SENTIMENT & THREAT PANIC VELOCITY ENGINE
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            NLP algorithmic sentiment tracking across dark web forums, telegram channels, and social media
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400">STATUS:</span>
          <span className="text-rose-400 font-bold tracking-wide">
            {fleetSummary.overallStatus.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Sentiment Metric Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Panic Index */}
        <div className="p-4 rounded-xl bg-slate-950 border border-rose-950/80 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-rose-400">
              <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              PANIC LEVEL
            </span>
            <span className="text-[10px] bg-rose-950 px-1.5 py-0.5 rounded text-rose-300">CRITICAL</span>
          </div>
          <div className="text-3xl font-black text-white">
            {fleetSummary.averageUrgency}%
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 h-full rounded-full transition-all"
              style={{ width: `${fleetSummary.averageUrgency}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            Based on {feedItems.length} active live intelligence vectors
          </p>
        </div>

        {/* Panic Detections */}
        <div className="p-4 rounded-xl bg-slate-950 border border-red-950/80 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-red-400">
              <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
              PANIC BREACHES
            </span>
            <span className="text-[10px] bg-red-950 px-1.5 py-0.5 rounded text-red-300">EMERGENCY</span>
          </div>
          <div className="text-3xl font-black text-red-400">
            {fleetSummary.panicCount}
          </div>
          <p className="text-[10px] text-slate-400">
            High-urgency zero-day or extortion dumps verified
          </p>
        </div>

        {/* Hostile Feeds */}
        <div className="p-4 rounded-xl bg-slate-950 border border-amber-950/80 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-amber-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              HOSTILE PROBES
            </span>
            <span className="text-[10px] bg-amber-950 px-1.5 py-0.5 rounded text-amber-300">ELEVATED</span>
          </div>
          <div className="text-3xl font-black text-amber-400">
            {fleetSummary.hostileCount}
          </div>
          <p className="text-[10px] text-slate-400">
            Active exploits, malware payloads, or botnets targeted
          </p>
        </div>

        {/* Threat Trend Velocity */}
        <div className="p-4 rounded-xl bg-slate-950 border border-emerald-950/80 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              VELOCITY
            </span>
            <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-300">TREND</span>
          </div>
          <div className="text-3xl font-black text-white">
            +18.4%
          </div>
          <p className="text-[10px] text-slate-400">
            Hostility spike detected in Southeast corridor over last 6 hours
          </p>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Interactive Sentiment Tester (7 Cols) */}
        <div className="lg:col-span-7 rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400" />
              Live Sentiment & Urgency Tester (Analyst Scratchpad)
            </h3>
            <span className="text-[10px] text-slate-400">Real-Time NLP Classifier</span>
          </div>

          <p className="text-xs text-slate-400">
            Paste any scraped forum post, chat transcript, or leak bulletin to calculate its panic index and threat severity score:
          </p>

          <textarea
            rows={3}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
          />

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const sample = 'LockBit affiliate confirms ransomware deployment on Florida municipal water supply telemetry switches.';
                  setTestText(sample);
                  setTestResult(analyzeThreatSentiment(sample));
                }}
                className="text-[10px] px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300"
              >
                Sample: Florida Water Ransomware
              </button>
              <button
                type="button"
                onClick={() => {
                  const sample = 'Volt Typhoon living-off-the-land reconnaissance on Georgia port network edge gateways.';
                  setTestText(sample);
                  setTestResult(analyzeThreatSentiment(sample));
                }}
                className="text-[10px] px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300"
              >
                Sample: Volt Typhoon GA Port
              </button>
            </div>

            <button
              onClick={handleRunTest}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Evaluate Sentiment
            </button>
          </div>

          {/* Test Evaluation Card */}
          <div className="mt-3 p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-bold">CLASSIFICATION RESULT:</span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                  testResult.label === 'PANIC'
                    ? 'bg-rose-950 text-rose-300 border border-rose-500'
                    : testResult.label === 'HOSTILE'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                }`}
              >
                {testResult.label} (Score: {testResult.score})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block">THREAT URGENCY:</span>
                <span className="text-white font-bold">{testResult.urgency}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">CONFIDENCE:</span>
                <span className="text-white font-bold">{testResult.confidence}%</span>
              </div>
            </div>

            {testResult.keywordsFound.length > 0 && (
              <div className="pt-1">
                <span className="text-[10px] text-slate-400 block mb-1">TRIGGER LEXICON MATCHED:</span>
                <div className="flex flex-wrap gap-1">
                  {testResult.keywordsFound.map((kw, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-red-300 border border-red-900/50">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Threat Keywords Cloud (5 Cols) */}
        <div className="lg:col-span-5 rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-3">
          <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-400" />
              Highest Frequency Threat Terms
            </h3>
            <span className="text-[10px] text-slate-500">Live Corpus</span>
          </div>

          <div className="space-y-2">
            {sortedKeywords.map(([kw, count]) => (
              <div key={kw} className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-900/70 border border-slate-800/80">
                <span className="text-slate-300 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {kw}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold">
                  {count} mentions
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
