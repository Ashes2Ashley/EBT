import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Radio, 
  Activity, 
  GlobeLock, 
  Search, 
  BellRing, 
  Bot, 
  Smartphone, 
  Volume2, 
  VolumeX, 
  ShieldCheck,
  Cpu,
  Lock,
  LogOut,
  Terminal
} from 'lucide-react';
import { PhoneAuthUser } from '../types/osint';
import { soundManager } from '../utils/audioAlert';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  phoneUser: PhoneAuthUser | null;
  onOpenPhoneAuth: () => void;
  onLockSession?: () => void;
  onLogout?: () => void;
  alertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  phoneUser,
  onOpenPhoneAuth,
  onLockSession,
  onLogout,
  alertCount
}) => {
  const [timeUtc, setTimeUtc] = useState<string>('');
  const [soundActive, setSoundActive] = useState<boolean>(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    soundManager.setSoundEnabled(next);
    if (next) {
      soundManager.playAlertChime('MED');
    }
  };

  const navItems = [
    { id: 'map', label: 'GA & FL Map', icon: MapPin, badge: 'TACTICAL' },
    { id: 'warroom', label: 'Crisis War Room', icon: ShieldAlert, badge: 'DEFCON' },
    { id: 'feed', label: 'OSINT Stream', icon: Radio, badge: 'PRIORITIZED' },
    { id: 'darkweb', label: 'Dark Web & Forums', icon: GlobeLock, badge: '0-DAYS' },
    { id: 'packets', label: 'Packet Sniffer', icon: Terminal, badge: 'LIVE TAP' },
    { id: 'crypto', label: 'Crypto Radar', icon: Search, badge: 'BLOCKCHAIN' },
    { id: 'counties', label: 'County Density', icon: Activity, badge: 'GA/FL' },
    { id: 'rules', label: 'Detection Rules', icon: Cpu, badge: 'YARA/SIGMA' },
    { id: 'sentiment', label: 'Sentiment Intel', icon: Activity },
    { id: 'ipfinder', label: 'IP Intelligence', icon: Search, badge: 'CIDR' },
    { id: 'alerts', label: 'Alert Webhooks', icon: BellRing, count: alertCount },
    { id: 'ai', label: 'AI Intel Analyst', icon: Bot }
  ];

  const isAdmin = phoneUser?.role === 'ADMIN' || phoneUser?.adminLevel === 'SOC_COMMANDER';

  return (
    <header className="border-b border-emerald-950/60 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-3 py-2.5 sm:px-6 font-mono">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Brand & Threat Level Telemetry */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 shadow-inner">
              <ShieldAlert className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-wider text-slate-100 flex items-center gap-1.5 font-mono">
                  ARGUS <span className="text-emerald-400">//</span> OSINT
                </h1>
                <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                  SE-DEFENSE CORRIDOR
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Georgia & Florida Critical Infrastructure Threat Defense Command
              </p>
            </div>
          </div>

          {/* Quick Mobile Controls */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <button
              onClick={toggleSound}
              aria-label={soundActive ? 'Mute alert sounds' : 'Enable alert sounds'}
              className="p-2 rounded border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-emerald-400 text-xs"
            >
              {soundActive ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={onOpenPhoneAuth}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border transition-all ${
                phoneUser?.authenticated
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/50'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{phoneUser?.authenticated ? phoneUser.role : 'LOGIN'}</span>
            </button>
          </div>
        </div>

        {/* Global HUD Ticker & Controls */}
        <div className="hidden xl:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-900/90 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400">DEFCON:</span>
            <span className="text-amber-400 font-bold">2 (ELEVATED THREAT)</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-900/90 border border-slate-800 text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">UTC:</span>
            <span>{timeUtc || 'SYNCHRONIZING...'}</span>
          </div>

          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundActive ? 'Mute tactical alerts' : 'Unmute tactical alerts'}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-slate-700 transition"
          >
            {soundActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-emerald-400">AUDIO CHIME ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] text-slate-500">MUTED</span>
              </>
            )}
          </button>

          {/* Phone OAuth Admin Status & Session Lock */}
          {phoneUser?.authenticated ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenPhoneAuth}
                className="flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-semibold shadow-sm bg-emerald-950/80 border-emerald-500 text-emerald-300 hover:bg-emerald-900/60 transition"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  {isAdmin ? 'SOC COMMANDER' : 'ANALYST'} ({phoneUser.phoneNumber})
                </span>
              </button>

              {onLockSession && (
                <button
                  onClick={onLockSession}
                  title="Lock Dashboard Session"
                  className="p-1.5 rounded border border-slate-800 hover:border-amber-500 text-slate-400 hover:text-amber-300 transition"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              )}

              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Revoke Session"
                  className="p-1.5 rounded border border-slate-800 hover:border-red-500 text-slate-400 hover:text-red-400 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenPhoneAuth}
              className="flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-medium shadow-sm bg-amber-950/50 border-amber-500/50 text-amber-200 hover:bg-amber-900/60 transition"
            >
              <Smartphone className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>PHONE OAUTH (SIGN IN)</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <nav className="flex items-center gap-1 mt-2.5 overflow-x-auto pb-1 scrollbar-none" aria-label="Dashboard Navigation">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                soundManager.playAlertChime('MED');
              }}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/80 shadow-sm shadow-emerald-950 font-bold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {item.badge}
                </span>
              )}
              {typeof item.count === 'number' && item.count > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-900/80 text-red-200 border border-red-500/50 font-bold animate-pulse">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
