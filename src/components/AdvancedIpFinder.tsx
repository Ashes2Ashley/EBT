import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Globe, 
  ShieldAlert, 
  ShieldCheck, 
  MapPin, 
  Server, 
  Terminal, 
  Copy, 
  Check, 
  Send, 
  Cpu, 
  AlertTriangle,
  LocateFixed,
  RefreshCw,
  ExternalLink,
  Layers,
  Activity,
  ArrowRight
} from 'lucide-react';
import { IpLookupResult } from '../types/osint';
import { lookupIpIntelligence, isValidIpv4 } from '../utils/ipIntelligence';
import { soundManager } from '../utils/audioAlert';

interface AdvancedIpFinderProps {
  initialIp?: string;
  onPlotOnMap?: (lat: number, lng: number) => void;
  onDispatchAlertForIp?: (ipResult: IpLookupResult) => void;
}

export const AdvancedIpFinder: React.FC<AdvancedIpFinderProps> = ({
  initialIp,
  onPlotOnMap,
  onDispatchAlertForIp
}) => {
  const [ipInput, setIpInput] = useState<string>(initialIp || '198.51.100.24');
  const [ipData, setIpData] = useState<IpLookupResult>(() => lookupIpIntelligence(initialIp || '198.51.100.24'));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'FORENSICS' | 'SUBNET_SCAN' | 'DNS_WHOIS' | 'TRACEROUTE'>('FORENSICS');
  const [isScanningSubnet, setIsScanningSubnet] = useState(false);
  const [subnetHosts, setSubnetHosts] = useState<{ ip: string; status: 'ONLINE' | 'FILTERED'; port: number; risk: 'HIGH' | 'LOW' }[]>([]);

  useEffect(() => {
    if (initialIp && initialIp !== ipData.ip) {
      setIpInput(initialIp);
      performLookup(initialIp);
    }
  }, [initialIp]);

  const performLookup = (target: string) => {
    const clean = target.trim();
    if (!clean) return;

    setIsLoading(true);

    setTimeout(() => {
      const res = lookupIpIntelligence(clean);
      setIpData(res);
      setIsLoading(false);
      soundManager.playAlertChime(res.threatScore > 75 ? 'CRITICAL' : 'MED');
    }, 300);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(ipInput);
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(JSON.stringify(ipData, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const runSubnetScanner = () => {
    setIsScanningSubnet(true);
    soundManager.playAlertChime('HIGH');

    setTimeout(() => {
      const baseParts = ipData.ip.split('.').slice(0, 3).join('.');
      const simulated = Array.from({ length: 12 }).map((_, i) => ({
        ip: `${baseParts}.${i + 1}`,
        status: (i % 3 === 0 ? 'ONLINE' : 'FILTERED') as 'ONLINE' | 'FILTERED',
        port: i % 2 === 0 ? 443 : 8080,
        risk: (i === 4 ? 'HIGH' : 'LOW') as 'HIGH' | 'LOW'
      }));
      setSubnetHosts(simulated);
      setIsScanningSubnet(false);
      soundManager.playAlertChime('MED');
    }, 800);
  };

  const presets = [
    { label: 'Volt Typhoon C2 (China/US Grid)', ip: '198.51.100.24', tag: 'C2 RELAY' },
    { label: 'Tor Exit / Brute Forcer (DE)', ip: '185.220.101.5', tag: 'TOR EXIT' },
    { label: 'Atlanta Municipal Gateway (GA)', ip: '199.111.226.1', tag: 'GOV ASSET' },
    { label: 'USF Cyber Lab Subnet (FL)', ip: '131.247.1.10', tag: 'RESEARCH' },
    { label: 'DigitalOcean Scanner (US)', ip: '167.99.145.82', tag: 'BOTNET' }
  ];

  const isHighRisk = ipData.threatScore > 70;

  return (
    <div className="space-y-4 font-mono text-slate-200">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-950 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              ADVANCED OSINT IP FINDER, BGP ASN & SUBNET RECONNAISSANCE
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Deep autonomous IP analysis, port banner grabs, subnet CIDR scanner, DNS/WHOIS, and traceroute hops
          </p>
        </div>

        {/* Threat Score Pill */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400">THREAT SCORE:</span>
          <span
            className={`font-black text-sm ${
              isHighRisk ? 'text-red-400 animate-pulse' : ipData.threatScore > 30 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {ipData.threatScore} / 100
          </span>
        </div>
      </div>

      {/* Search Input & Presets */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="Enter any IPv4 or IPv6 address (e.g. 198.51.100.24)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Tracing...
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                Analyze IP
              </>
            )}
          </button>
        </form>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 font-semibold mr-1">Quick Presets:</span>
          {presets.map(p => (
            <button
              key={p.ip}
              onClick={() => {
                setIpInput(p.ip);
                performLookup(p.ip);
              }}
              className={`text-[11px] px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition ${
                ipData.ip === p.ip
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span>{p.label}</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 text-slate-400">{p.tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Tabs: Forensics, Subnet Scan, DNS/WHOIS, Traceroute */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('FORENSICS')}
          className={`px-3 py-1.5 rounded font-bold transition whitespace-nowrap ${
            activeTab === 'FORENSICS' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          CORE NETWORK & PORTS
        </button>
        <button
          onClick={() => {
            setActiveTab('SUBNET_SCAN');
            if (subnetHosts.length === 0) runSubnetScanner();
          }}
          className={`px-3 py-1.5 rounded font-bold transition whitespace-nowrap ${
            activeTab === 'SUBNET_SCAN' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          CIDR /24 SUBNET SCANNER
        </button>
        <button
          onClick={() => setActiveTab('DNS_WHOIS')}
          className={`px-3 py-1.5 rounded font-bold transition whitespace-nowrap ${
            activeTab === 'DNS_WHOIS' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          DNS & WHOIS RECON
        </button>
        <button
          onClick={() => setActiveTab('TRACEROUTE')}
          className={`px-3 py-1.5 rounded font-bold transition whitespace-nowrap ${
            activeTab === 'TRACEROUTE' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          BGP TRACEROUTE HOPS
        </button>
      </div>

      {activeTab === 'FORENSICS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Identity & Geolocation */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  Network Identity & Geolocation
                </h3>
                <span className="text-[10px] text-slate-500">Autonomous System</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">IP ADDRESS:</span>
                    <span className="text-emerald-400 font-bold text-sm">{ipData.ip}</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">REVERSE PTR HOSTNAME:</span>
                    <span className="text-slate-200 truncate block text-[11px]">{ipData.hostname || 'None configured'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">LOCATION:</span>
                    <span className="text-white font-semibold">
                      {ipData.city}, {ipData.region} ({ipData.country})
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">COORDINATES:</span>
                    <span className="text-slate-200 font-mono text-[11px]">
                      {ipData.latitude.toFixed(4)}°N, {ipData.longitude.toFixed(4)}°E
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">ASN & ORGANIZATION:</span>
                  <span className="text-slate-200 block font-semibold">{ipData.asn}</span>
                  <span className="text-[11px] text-slate-400">{ipData.org} ({ipData.isp})</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ipData.isKnownC2 && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/70 font-bold">
                      KNOWN C2 COMMAND NODE
                    </span>
                  )}
                  {ipData.isTorExit && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/70 font-bold">
                      VERIFIED TOR EXIT NODE
                    </span>
                  )}
                  {ipData.isVpnProxy && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/70 font-bold">
                      ANONYMIZING PROXY / VPN
                    </span>
                  )}
                  {ipData.isGeorgiaFloridaTarget && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/70 font-bold">
                      CORRELATED WITH GA/FL SECTOR
                    </span>
                  )}
                </div>
              </div>

              {ipData.associatedThreatActor && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/50 text-xs">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                    ADVERSARY ATTRIBUTION:
                  </span>
                  <p className="text-white font-bold mt-0.5">
                    Linked to {ipData.associatedThreatActor} Campaign Infrastructure
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5">{ipData.lastSeenAttack}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={handleCopyReport}
                  className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs flex items-center gap-1.5 text-slate-300"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? 'JSON Copied' : 'Export Forensic JSON'}</span>
                </button>

                {onDispatchAlertForIp && (
                  <button
                    onClick={() => onDispatchAlertForIp(ipData)}
                    className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Alert for IP</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Port Scanner & Blacklists */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  Active Port Scanner & Fingerprints ({ipData.openPorts.length})
                </h3>
                <span className="text-[10px] text-slate-500">SYN / Banner Grab</span>
              </div>

              <div className="space-y-1.5">
                {ipData.openPorts.map((p) => {
                  const isRisk = p.risk === 'HIGH';
                  return (
                    <div
                      key={p.port}
                      className={`p-2 rounded border text-xs flex items-center justify-between ${
                        isRisk
                          ? 'bg-red-950/30 border-red-900/60 text-red-200'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-emerald-400">PORT {p.port}</span>
                          <span className="text-white font-medium">{p.service}</span>
                        </div>
                        {p.banner && (
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">Banner: {p.banner}</p>
                        )}
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          isRisk ? 'bg-red-900 text-red-200' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {p.risk} RISK
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  Reputation & Blacklist Feeds
                </h3>
                <span className="text-[10px] text-slate-500">Verification Engine</span>
              </div>

              <div className="space-y-1.5">
                {ipData.blacklists.map((b) => (
                  <div
                    key={b.name}
                    className="p-2 rounded bg-slate-900/70 border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="text-slate-200 font-semibold">{b.name}</span>
                      <span className="text-[10px] text-slate-500 ml-2">({b.category})</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        b.listed
                          ? 'bg-red-950 text-red-300 border border-red-500/70 animate-pulse'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                      }`}
                    >
                      {b.listed ? 'LISTED' : 'CLEAN'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subnet CIDR Scanner */}
      {activeTab === 'SUBNET_SCAN' && (
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                CIDR /24 Subnet Live Host Scan ({ipData.ip.split('.').slice(0, 3).join('.')}.0/24)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Sweep of neighboring hosts on the same autonomous system block
              </p>
            </div>
            <button
              onClick={runSubnetScanner}
              disabled={isScanningSubnet}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanningSubnet ? 'animate-spin' : ''}`} />
              <span>{isScanningSubnet ? 'Scanning...' : 'Re-scan Subnet'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {subnetHosts.map(h => (
              <div
                key={h.ip}
                onClick={() => performLookup(h.ip)}
                className={`p-3 rounded-lg border cursor-pointer transition text-xs space-y-1 ${
                  h.ip === ipData.ip
                    ? 'bg-emerald-950/70 border-emerald-500 text-white font-bold'
                    : h.risk === 'HIGH'
                    ? 'bg-red-950/30 border-red-900/60 text-red-200'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px]">{h.ip}</span>
                  <span className={`w-2 h-2 rounded-full ${h.status === 'ONLINE' ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                </div>
                <div className="text-[10px] text-slate-500">Port {h.port} &bull; {h.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DNS & WHOIS Records */}
      {activeTab === 'DNS_WHOIS' && (
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Authoritative DNS & WHOIS Records
            </h3>
            <span className="text-xs text-slate-400 font-mono">{ipData.hostname || `${ipData.ip}.in-addr.arpa`}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Registrar:</span>
              <p className="text-white">Regional Internet Registry ({ipData.countryCode})</p>
            </div>
            <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Allocated Organization:</span>
              <p className="text-white">{ipData.org}</p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              DNS Zone Records:
            </span>
            <div className="space-y-1 text-xs font-mono">
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-emerald-400 font-bold">A Record:</span>
                <span className="text-white">{ipData.ip} (TTL 300)</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-emerald-400 font-bold">PTR Record:</span>
                <span className="text-white">{ipData.hostname || 'None'} (TTL 3600)</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-emerald-400 font-bold">SOA Record:</span>
                <span className="text-white">ns1.{ipData.countryCode.toLowerCase()}.netops.io (TTL 86400)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Traceroute Hops */}
      {activeTab === 'TRACEROUTE' && (
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Autonomous BGP Routing & Hop Dissection
            </h3>
            <span className="text-xs text-slate-400 font-mono">Target: {ipData.ip}</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {[
              { hop: 1, ip: '10.0.0.1', rtt: '1.2 ms', name: 'Local SOC Gateway Core' },
              { hop: 2, ip: '172.16.80.1', rtt: '3.4 ms', name: 'Southeast Regional Fiber Ring (Atlanta)' },
              { hop: 3, ip: '64.125.14.92', rtt: '14.8 ms', name: 'Zayo Tier-1 Transit Backbone' },
              { hop: 4, ip: '209.85.240.18', rtt: '22.1 ms', name: 'Internet Exchange Point (Miami Equinix)' },
              { hop: 5, ip: ipData.ip, rtt: '48.6 ms', name: `${ipData.city} Host Destination (${ipData.asn})` }
            ].map(h => (
              <div key={h.hop} className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-bold">HOP #{h.hop}</span>
                  <span className="text-emerald-400 font-bold">{h.ip}</span>
                  <span className="text-slate-300 hidden sm:inline">&bull; {h.name}</span>
                </div>
                <span className="text-slate-400">{h.rtt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
