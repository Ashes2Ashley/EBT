import React, { useState } from 'react';
import { 
  BellRing, 
  Send, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  Trash2, 
  Sliders, 
  RefreshCw, 
  ShieldAlert, 
  Terminal,
  ExternalLink,
  Mail,
  MessageSquare
} from 'lucide-react';
import { AlertRule, AlertDispatchRecord, ThreatLevel, FeedItem } from '../types/osint';
import { soundManager } from '../utils/audioAlert';

interface AlertNotificationHubProps {
  rules: AlertRule[];
  dispatchHistory: AlertDispatchRecord[];
  onAddRule: (rule: AlertRule) => void;
  onToggleRule: (id: string) => void;
  onDeleteRule: (id: string) => void;
  onTriggerManualWebhook: (channel: 'discord' | 'slack' | 'email', title: string, details: string) => void;
}

export const AlertNotificationHub: React.FC<AlertNotificationHubProps> = ({
  rules,
  dispatchHistory,
  onAddRule,
  onToggleRule,
  onDeleteRule,
  onTriggerManualWebhook
}) => {
  const [activeTab, setActiveTab] = useState<'RULES' | 'HISTORY' | 'TEST_DISPATCH'>('TEST_DISPATCH');
  const [testChannel, setTestChannel] = useState<'discord' | 'slack' | 'email'>('discord');
  const [testWebhookUrl, setTestWebhookUrl] = useState('https://discord.com/api/webhooks/mock-argus-soc-channel/ga-fl-threats');
  const [testEmail, setTestEmail] = useState('jordan.gloria61@yahoo.com');
  const [testTitle, setTestTitle] = useState('CRITICAL ALERT: Volt Typhoon SCADA probe confirmed on Port of Savannah');
  const [testBody, setTestBody] = useState('Urgent telemetry confirms inbound living-off-the-land commands on Savannah Port edge routers targeting Georgia maritime infrastructure.');
  const [isDispatching, setIsDispatching] = useState(false);
  const [lastDispatchSuccess, setLastDispatchSuccess] = useState<string | null>(null);

  // New Rule Modal
  const [showNewRuleModal, setShowNewRuleModal] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleMinLevel, setNewRuleMinLevel] = useState<ThreatLevel>('HIGH');
  const [newRuleState, setNewRuleState] = useState<'All' | 'Georgia' | 'Florida'>('All');
  const [newRulePanicOnly, setNewRulePanicOnly] = useState(false);
  const [newRuleKeywords, setNewRuleKeywords] = useState('scada, zero-day, ransomware');

  const handleExecuteTestDispatch = async () => {
    setIsDispatching(true);
    setLastDispatchSuccess(null);
    soundManager.playAlertChime('HIGH');

    // Simulate network dispatch with realistic latency
    setTimeout(() => {
      onTriggerManualWebhook(testChannel, testTitle, testBody);
      setIsDispatching(false);
      setLastDispatchSuccess(`Alert successfully dispatched via ${testChannel.toUpperCase()} to ${testChannel === 'email' ? testEmail : 'Configured Webhook'} in 142ms`);
      soundManager.playAlertChime('HIGH');
    }, 500);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    const newRule: AlertRule = {
      id: `rule-${Date.now()}`,
      name: newRuleName,
      enabled: true,
      channels: ['discord', 'slack', 'email'],
      minThreatLevel: newRuleMinLevel,
      stateFilter: newRuleState,
      panicSentimentOnly: newRulePanicOnly,
      keywords: newRuleKeywords.split(',').map(k => k.trim()).filter(Boolean),
      webhookUrlDiscord: testWebhookUrl,
      alertEmail: testEmail
    };

    onAddRule(newRule);
    soundManager.playAlertChime('MED');
    setShowNewRuleModal(false);
    setNewRuleName('');
  };

  return (
    <div className="space-y-4 font-mono text-slate-200">
      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-wide">
              AUTOMATED ALERT NOTIFICATIONS // DISCORD, SLACK & EMAIL WEBHOOKS
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Zero-latency automated security alert dispatch when threat thresholds, sentiment panic, or target regions trigger
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('TEST_DISPATCH')}
            className={`px-3 py-1.5 rounded font-bold transition ${
              activeTab === 'TEST_DISPATCH' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            DISPATCH TESTER
          </button>
          <button
            onClick={() => setActiveTab('RULES')}
            className={`px-3 py-1.5 rounded font-bold transition ${
              activeTab === 'RULES' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            RULES ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 py-1.5 rounded font-bold transition ${
              activeTab === 'HISTORY' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            AUDIT LOG ({dispatchHistory.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Dispatch Tester & Webhook Payload Generator */}
      {activeTab === 'TEST_DISPATCH' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Dispatch Configurator (7 Cols) */}
          <div className="lg:col-span-7 rounded-xl bg-slate-950 border border-slate-800 p-5 space-y-4 shadow-xl">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                Live Notification Webhook Dispatcher
              </h3>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
                SUB-SECOND RESPONSE ENGINE
              </span>
            </div>

            {/* Target Channel Selector */}
            <div className="space-y-1.5 text-xs">
              <label className="block text-slate-300 font-semibold">Select Dispatch Channel:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTestChannel('discord')}
                  className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    testChannel === 'discord'
                      ? 'bg-[#5865F2]/20 border-[#5865F2] text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#5865F2]" />
                  <span>Discord Webhook</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTestChannel('slack')}
                  className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    testChannel === 'slack'
                      ? 'bg-[#4A154B]/30 border-[#E01E5A] text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#E01E5A]" />
                  <span>Slack Webhook</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTestChannel('email')}
                  className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    testChannel === 'email'
                      ? 'bg-amber-950/40 border-amber-500 text-amber-300 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Email (SMTP)</span>
                </button>
              </div>
            </div>

            {/* Endpoint / Target Input */}
            <div className="space-y-1 text-xs">
              <label className="block text-slate-300 font-semibold">
                {testChannel === 'email' ? 'Recipient Security Officer Email:' : `${testChannel.toUpperCase()} Webhook Endpoint URL:`}
              </label>
              {testChannel === 'email' ? (
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
                />
              ) : (
                <input
                  type="url"
                  value={testWebhookUrl}
                  onChange={(e) => setTestWebhookUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
                />
              )}
            </div>

            {/* Alert Title & Body */}
            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Alert Headline / Subject:</label>
                <input
                  type="text"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Alert Payload Telemetry:</label>
                <textarea
                  rows={3}
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
                />
              </div>
            </div>

            {lastDispatchSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-500/60 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{lastDispatchSuccess}</span>
              </div>
            )}

            <button
              onClick={handleExecuteTestDispatch}
              disabled={isDispatching}
              className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isDispatching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Dispatching to {testChannel.toUpperCase()}...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Dispatch Instant Test Notification
                </>
              )}
            </button>
          </div>

          {/* Webhook Payload Live Preview (5 Cols) */}
          <div className="lg:col-span-5 rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-3">
            <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Live JSON Payload Preview ({testChannel.toUpperCase()})
              </h3>
              <span className="text-[10px] text-slate-500">RFC 8259</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono overflow-x-auto max-h-[380px] text-slate-300">
              <pre>
                {JSON.stringify(
                  testChannel === 'discord'
                    ? {
                        username: 'ARGUS SOC Radar',
                        avatar_url: 'https://argus-threat-intel.app/avatar.png',
                        embeds: [
                          {
                            title: `🚨 ${testTitle}`,
                            description: testBody,
                            color: 15158332,
                            fields: [
                              { name: 'Target Region', value: 'Georgia & Florida Corridor', inline: true },
                              { name: 'Threat Level', value: 'CRITICAL (DEFCON 2)', inline: true },
                              { name: 'Sentiment Panic Index', value: '94% Hostile Panic', inline: true },
                              { name: 'Mitigation Status', value: 'Perimeter Scrubbing Active', inline: false }
                            ],
                            timestamp: new Date().toISOString()
                          }
                        ]
                      }
                    : testChannel === 'slack'
                    ? {
                        text: `*🚨 CRITICAL SECURITY ALERT // ARGUS SOC*\n*${testTitle}*\n${testBody}`,
                        blocks: [
                          {
                            type: 'section',
                            text: { type: 'mrkdwn', text: `*${testTitle}*\n${testBody}` }
                          },
                          {
                            type: 'context',
                            elements: [{ type: 'mrkdwn', text: 'Sent by ARGUS OSINT Automated Dispatch Engine' }]
                          }
                        ]
                      }
                    : {
                        to: testEmail,
                        subject: `[CRITICAL ALERT] ${testTitle}`,
                        from: 'argus-soc-alerts@intelligence.us',
                        headers: { 'X-Priority': '1 (Highest)', 'X-Threat-Score': '96' },
                        bodyText: `${testTitle}\n\n${testBody}\n\nImmediate response required.`
                      },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Automated Alert Rules */}
      {activeTab === 'RULES' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <p className="text-xs text-slate-400">
              Configured automated trigger rules for instant multi-channel dispatch:
            </p>
            <button
              onClick={() => setShowNewRuleModal(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Alert Rule</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {rules.map(rule => (
              <div
                key={rule.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{rule.name}</h4>
                    <span
                      className={`text-[9px] px-2 py-0.2 rounded font-bold uppercase ${
                        rule.enabled ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      {rule.enabled ? 'ENABLED' : 'PAUSED'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-0.5">
                    <span>Min Severity: <strong className="text-red-400">{rule.minThreatLevel}</strong></span>
                    <span>•</span>
                    <span>State: <strong className="text-slate-200">{rule.stateFilter}</strong></span>
                    <span>•</span>
                    <span>Channels: {rule.channels.join(', ').toUpperCase()}</span>
                    <span>•</span>
                    <span>Keywords: {rule.keywords.join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleRule(rule.id)}
                    className={`text-xs px-2.5 py-1 rounded border transition ${
                      rule.enabled
                        ? 'border-emerald-500/60 text-emerald-400 hover:bg-emerald-950'
                        : 'border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {rule.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => onDeleteRule(rule.id)}
                    className="text-xs p-1.5 rounded border border-slate-800 hover:border-red-500 text-slate-400 hover:text-red-400 transition"
                    title="Delete Rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Dispatch Audit History Log */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-2">
          {dispatchHistory.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-500 text-xs">
              No alert dispatches recorded yet. Use the Dispatch Tester or trigger a threat alert from the Live Stream.
            </div>
          ) : (
            dispatchHistory.map(record => (
              <div
                key={record.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-emerald-400 font-bold uppercase">
                      {record.channel}
                    </span>
                    <span className="font-bold text-white">{record.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-lg">
                    Recipient: {record.recipient} • Latency: {record.latencyMs}ms
                  </p>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold">
                    {record.status}
                  </span>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">{record.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* New Rule Modal */}
      {showNewRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-emerald-500/40 bg-slate-950 p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              Add Automated Alert Rule
            </h3>

            <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Rule Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Georgia Water SCADA Alarm"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Severity:</label>
                  <select
                    value={newRuleMinLevel}
                    onChange={(e) => setNewRuleMinLevel(e.target.value as ThreatLevel)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="ELEVATED">ELEVATED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target State:</label>
                  <select
                    value={newRuleState}
                    onChange={(e) => setNewRuleState(e.target.value as 'All' | 'Georgia' | 'Florida')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="All">All States</option>
                    <option value="Georgia">Georgia Only</option>
                    <option value="Florida">Florida Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Trigger Keywords (comma separated):</label>
                <input
                  type="text"
                  value={newRuleKeywords}
                  onChange={(e) => setNewRuleKeywords(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="panic-check"
                  checked={newRulePanicOnly}
                  onChange={(e) => setNewRulePanicOnly(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                />
                <label htmlFor="panic-check" className="text-slate-300 text-xs">
                  Require Panic / Hostile Sentiment Score
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewRuleModal(false)}
                  className="px-3 py-1.5 rounded border border-slate-700 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
