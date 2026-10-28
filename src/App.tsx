import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { GeorgiaFloridaMap } from './components/GeorgiaFloridaMap';
import { LiveThreatFeed } from './components/LiveThreatFeed';
import { SentimentAnalytics } from './components/SentimentAnalytics';
import { DarkWebAttribution } from './components/DarkWebAttribution';
import { AdvancedIpFinder } from './components/AdvancedIpFinder';
import { AlertNotificationHub } from './components/AlertNotificationHub';
import { AiIntelAnalyst } from './components/AiIntelAnalyst';
import { PhoneAuthModal } from './components/PhoneAuthModal';
import { IncidentWarRoom } from './components/IncidentWarRoom';
import { PacketInterceptor } from './components/PacketInterceptor';
import { CryptoWalletRadar } from './components/CryptoWalletRadar';
import { CountyHeatmap } from './components/CountyHeatmap';
import { YaraRuleGenerator } from './components/YaraRuleGenerator';
import { AuthGate } from './components/AuthGate';

import { 
  FeedItem, 
  MapAsset, 
  AlertRule, 
  AlertDispatchRecord, 
  PhoneAuthUser, 
  IpLookupResult 
} from './types/osint';
import { 
  INITIAL_FEED_ITEMS, 
  GEORGIA_FLORIDA_ASSETS, 
  INITIAL_ALERT_RULES, 
  DEMO_PHONE_ADMINS 
} from './data/seedData';
import { evaluateThreatPrioritization } from './utils/prioritization';
import { loadStoredSession, saveStoredSession, logAuthAuditRecord } from './utils/auth';
import { soundManager } from './utils/audioAlert';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('map');
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState<boolean>(false);
  const [phoneUser, setPhoneUser] = useState<PhoneAuthUser | null>(() => {
    const stored = loadStoredSession();
    return stored || DEMO_PHONE_ADMINS[0]; // Authorized default for instant seamless interaction
  });
  const [isSessionLocked, setIsSessionLocked] = useState<boolean>(false);

  // Initialize feed items with dynamic multi-factor prioritization
  const [feedItems, setFeedItems] = useState<FeedItem[]>(() => {
    return INITIAL_FEED_ITEMS.map(item => ({
      ...item,
      prioritization: evaluateThreatPrioritization({
        actorName: item.attributedActor,
        sector: item.targetGeo?.sector,
        content: item.title + ' ' + item.content,
        state: item.targetGeo?.state,
        city: item.targetGeo?.city,
        signals: {
          liveAttackInProgress: item.threatLevel === 'CRITICAL',
          sampleVerified: item.verified
        }
      })
    }));
  });

  const [mapAssets, setMapAssets] = useState<MapAsset[]>(GEORGIA_FLORIDA_ASSETS);
  const [alertRules, setAlertRules] = useState<AlertRule[]>(INITIAL_ALERT_RULES);
  const [dispatchHistory, setDispatchHistory] = useState<AlertDispatchRecord[]>([
    {
      id: 'disp-01',
      timestamp: '18 min ago',
      channel: 'discord',
      title: 'CRITICAL ALERT: Volt Typhoon persistence in Savannah Port edge switches',
      recipient: '#ga-fl-threat-intel (Discord Webhook)',
      status: 'DELIVERED',
      latencyMs: 148,
      payloadPreview: '{"embeds": [{"title": "Volt Typhoon Savannah Port", "color": 15158332}]}'
    },
    {
      id: 'disp-02',
      timestamp: '32 min ago',
      channel: 'email',
      title: 'Ransomware Extortion Warning: LockBit 3.0 South Florida Healthcare',
      recipient: 'jordan.gloria61@yahoo.com',
      status: 'SENT',
      latencyMs: 310,
      payloadPreview: 'Subject: [CRITICAL] LockBit 3.0 Extortion Timer Active'
    }
  ]);
  const [selectedIpForInvestigation, setSelectedIpForInvestigation] = useState<string>('198.51.100.24');

  // URL parameters handler (e.g. ?tab=darkweb, ?lock=1)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['map', 'feed', 'sentiment', 'darkweb', 'ipfinder', 'alerts', 'ai'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
      if (params.get('lock') === '1') {
        setIsSessionLocked(true);
      }
    }
  }, []);

  const handleAddFeedItem = (item: FeedItem) => {
    setFeedItems(prev => [item, ...prev]);

    // Check alert rules
    for (const rule of alertRules) {
      if (!rule.enabled) continue;

      const levelMatch = 
        (rule.minThreatLevel === 'ELEVATED' && ['ELEVATED', 'HIGH', 'CRITICAL'].includes(item.threatLevel)) ||
        (rule.minThreatLevel === 'HIGH' && ['HIGH', 'CRITICAL'].includes(item.threatLevel)) ||
        (rule.minThreatLevel === 'CRITICAL' && item.threatLevel === 'CRITICAL');

      const stateMatch = 
        rule.stateFilter === 'All' || 
        (item.targetGeo && item.targetGeo.state === rule.stateFilter);

      const panicMatch = !rule.panicSentimentOnly || item.sentiment.label === 'PANIC';

      if (levelMatch && stateMatch && panicMatch) {
        for (const channel of rule.channels) {
          const newRecord: AlertDispatchRecord = {
            id: `disp-auto-${Date.now()}-${channel}`,
            timestamp: 'Just Now',
            channel,
            title: `AUTO-TRIGGER [${rule.name}]: ${item.title}`,
            recipient: channel === 'email' ? (rule.alertEmail || 'jordan.gloria61@yahoo.com') : `Auto Webhook (${channel.toUpperCase()})`,
            status: 'DELIVERED',
            latencyMs: Math.floor(90 + Math.random() * 80),
            payloadPreview: JSON.stringify({ itemTitle: item.title, threatLevel: item.threatLevel })
          };
          setDispatchHistory(h => [newRecord, ...h]);
        }
      }
    }
  };

  const handleDispatchAlertFromFeed = (item: FeedItem) => {
    soundManager.playAlertChime('HIGH');
    const newRecord: AlertDispatchRecord = {
      id: `disp-manual-${Date.now()}`,
      timestamp: 'Just Now',
      channel: 'discord',
      title: `MANUAL DISPATCH: ${item.title}`,
      recipient: '#soc-emergency-response (Discord Webhook)',
      status: 'DELIVERED',
      latencyMs: 124,
      payloadPreview: JSON.stringify(item)
    };
    setDispatchHistory(prev => [newRecord, ...prev]);
    setActiveTab('alerts');
  };

  const handleTriggerManualWebhook = (channel: 'discord' | 'slack' | 'email', title: string, details: string) => {
    const newRecord: AlertDispatchRecord = {
      id: `disp-manual-${Date.now()}`,
      timestamp: 'Just Now',
      channel,
      title,
      recipient: channel === 'email' ? 'jordan.gloria61@yahoo.com' : `${channel.toUpperCase()} Dispatch Channel`,
      status: 'DELIVERED',
      latencyMs: Math.floor(110 + Math.random() * 60),
      payloadPreview: details
    };
    setDispatchHistory(prev => [newRecord, ...prev]);
  };

  const handleDispatchAlertForIp = (ipResult: IpLookupResult) => {
    soundManager.playAlertChime('CRITICAL');
    const newRecord: AlertDispatchRecord = {
      id: `disp-ip-${Date.now()}`,
      timestamp: 'Just Now',
      channel: 'discord',
      title: `IP THREAT RADAR: Blocklist Alert for ${ipResult.ip} (${ipResult.asn})`,
      recipient: '#cyber-firewall-ops (Discord Webhook)',
      status: 'DELIVERED',
      latencyMs: 118,
      payloadPreview: JSON.stringify({
        ip: ipResult.ip,
        threatScore: ipResult.threatScore,
        geo: `${ipResult.city}, ${ipResult.country}`,
        actor: ipResult.associatedThreatActor
      })
    };
    setDispatchHistory(prev => [newRecord, ...prev]);
    setActiveTab('alerts');
  };

  const handleSelectIpForInvestigation = (ip: string) => {
    setSelectedIpForInvestigation(ip);
    setActiveTab('ipfinder');
    soundManager.playAlertChime('MED');
  };

  const handleLockSession = () => {
    setIsSessionLocked(true);
    soundManager.playAlertChime('MED');
  };

  const handleLogout = () => {
    if (phoneUser) {
      logAuthAuditRecord({
        phoneNumber: phoneUser.phoneNumber,
        action: 'LOGOUT',
        role: phoneUser.role,
        ipAddress: '199.111.226.1',
        userAgent: 'ARGUS SOC Web',
        status: 'SUCCESS'
      });
    }
    setPhoneUser(null);
    saveStoredSession(null);
    setIsSessionLocked(true);
    soundManager.playAlertChime('HIGH');
  };

  const handleAuthenticated = (user: PhoneAuthUser) => {
    setPhoneUser(user);
    setIsSessionLocked(false);
    setIsPhoneModalOpen(false);
  };

  const isAdmin = phoneUser?.role === 'ADMIN' || phoneUser?.adminLevel === 'SOC_COMMANDER';

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col tactical-grid font-mono">
      {/* Top Tactical Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        phoneUser={phoneUser}
        onOpenPhoneAuth={() => setIsPhoneModalOpen(true)}
        onLockSession={handleLockSession}
        onLogout={handleLogout}
        alertCount={dispatchHistory.length}
      />

      {/* Main OSINT Console Surface */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6">
        {activeTab === 'map' && (
          <GeorgiaFloridaMap
            assets={mapAssets}
            onSelectIpForInvestigation={handleSelectIpForInvestigation}
            onOpenPhoneAuth={() => setIsPhoneModalOpen(true)}
            isAdmin={Boolean(isAdmin)}
          />
        )}

        {activeTab === 'feed' && (
          <LiveThreatFeed
            feedItems={feedItems}
            onAddFeedItem={handleAddFeedItem}
            onDispatchAlert={handleDispatchAlertFromFeed}
            onSelectIpForInvestigation={handleSelectIpForInvestigation}
            isAdmin={Boolean(isAdmin)}
          />
        )}

        {activeTab === 'darkweb' && (
          <DarkWebAttribution
            feedItems={feedItems}
            onSelectIpForInvestigation={handleSelectIpForInvestigation}
            onDispatchAlert={(title, details) => handleTriggerManualWebhook('discord', title, details)}
            isAdmin={Boolean(isAdmin)}
          />
        )}

        {activeTab === 'warroom' && (
          <IncidentWarRoom
            onDispatchAlert={(title, details) => handleTriggerManualWebhook('discord', title, details)}
            isAdmin={Boolean(isAdmin)}
          />
        )}

        {activeTab === 'packets' && (
          <PacketInterceptor
            onSelectIpForInvestigation={handleSelectIpForInvestigation}
          />
        )}

        {activeTab === 'crypto' && (
          <CryptoWalletRadar />
        )}

        {activeTab === 'counties' && (
          <CountyHeatmap
            onSelectCountyForMap={() => setActiveTab('map')}
          />
        )}

        {activeTab === 'rules' && (
          <YaraRuleGenerator />
        )}

        {activeTab === 'sentiment' && (
          <SentimentAnalytics
            feedItems={feedItems}
          />
        )}

        {activeTab === 'ipfinder' && (
          <AdvancedIpFinder
            initialIp={selectedIpForInvestigation}
            onPlotOnMap={() => setActiveTab('map')}
            onDispatchAlertForIp={handleDispatchAlertForIp}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertNotificationHub
            rules={alertRules}
            dispatchHistory={dispatchHistory}
            onAddRule={(r) => setAlertRules(prev => [r, ...prev])}
            onToggleRule={(id) => setAlertRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))}
            onDeleteRule={(id) => setAlertRules(prev => prev.filter(r => r.id !== id))}
            onTriggerManualWebhook={handleTriggerManualWebhook}
          />
        )}

        {activeTab === 'ai' && (
          <AiIntelAnalyst />
        )}
      </main>

      {/* AuthGate Security Screen (active when session locked or unauthorized) */}
      {isSessionLocked && (
        <AuthGate
          onAuthenticated={handleAuthenticated}
        />
      )}

      {/* Phone OAuth Modal */}
      <PhoneAuthModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        phoneUser={phoneUser}
        onUpdatePhoneUser={(u) => {
          setPhoneUser(u);
          saveStoredSession(u);
        }}
      />

      {/* Tactical Status Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-2.5 text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>ARGUS SOC PLATFORM // SECTOR 4: GEORGIA & FLORIDA TACTICAL DEFENSE</span>
        </div>
        <div className="flex items-center gap-4">
          <span>WEBHOOKS: READY (DISCORD/SLACK/SMTP)</span>
          <span>
            CLEARANCE: {phoneUser?.authenticated ? `${phoneUser.role} (${phoneUser.phoneNumber})` : 'UNAUTHORIZED'}
          </span>
          <span>BUILD VERSION: 5.1.0-ENTERPRISE</span>
        </div>
      </footer>
    </div>
  );
}
