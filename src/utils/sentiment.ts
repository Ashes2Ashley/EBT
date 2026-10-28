import { SentimentAnalysis, ThreatLevel } from '../types/osint';

const PANIC_KEYWORDS = [
  'zero-day', '0-day', 'imminent', 'unpatched', 'critical', 'wipe', 'ransomware',
  'extortion', 'breached', 'compromised', 'scada', 'blackout', 'meltdown',
  'killswitch', 'pipeline', 'catastrophic', 'urgent', 'evacuate', 'leak dump'
];

const HOSTILE_KEYWORDS = [
  'exploit', 'payload', 'attack', 'apt28', 'apt29', 'lockbit', 'c2', 'beacon',
  'exfiltration', 'brute force', 'ddos', 'botnet', 'malware', 'backdoor',
  'shellcode', 'infiltrate', 'bypass', 'unauthorized', 'threat actor'
];

const ALARMING_KEYWORDS = [
  'vulnerability', 'cve', 'suspicious', 'reconnaissance', 'scanning', 'probe',
  'phishing', 'spoofed', 'anomalous', 'elevated', 'unusual activity', 'warning'
];

export function analyzeThreatSentiment(text: string): SentimentAnalysis {
  if (!text || text.trim().length === 0) {
    return {
      score: 0,
      label: 'NEUTRAL',
      urgency: 10,
      confidence: 50,
      keywordsFound: []
    };
  }

  const normalized = text.toLowerCase();
  const matchedPanic: string[] = [];
  const matchedHostile: string[] = [];
  const matchedAlarming: string[] = [];

  for (const kw of PANIC_KEYWORDS) {
    if (normalized.includes(kw)) matchedPanic.push(kw);
  }
  for (const kw of HOSTILE_KEYWORDS) {
    if (normalized.includes(kw)) matchedHostile.push(kw);
  }
  for (const kw of ALARMING_KEYWORDS) {
    if (normalized.includes(kw)) matchedAlarming.push(kw);
  }

  const totalMatches = matchedPanic.length * 3 + matchedHostile.length * 2 + matchedAlarming.length;
  const allKeywords = [...new Set([...matchedPanic, ...matchedHostile, ...matchedAlarming])];

  let label: SentimentAnalysis['label'] = 'NEUTRAL';
  let score = 0.0;
  let urgency = 20;

  if (matchedPanic.length >= 1) {
    label = 'PANIC';
    score = -0.85 - Math.min(0.15, matchedPanic.length * 0.03);
    urgency = Math.min(99, 75 + matchedPanic.length * 6);
  } else if (matchedHostile.length >= 1 || totalMatches >= 3) {
    label = 'HOSTILE';
    score = -0.55 - Math.min(0.25, matchedHostile.length * 0.04);
    urgency = Math.min(85, 55 + matchedHostile.length * 5);
  } else if (matchedAlarming.length >= 1 || totalMatches >= 1) {
    label = 'ALARMING';
    score = -0.30 - Math.min(0.20, matchedAlarming.length * 0.03);
    urgency = Math.min(65, 35 + matchedAlarming.length * 4);
  }

  // Confidence calculation based on length and matches
  const confidence = Math.min(98, Math.max(60, 50 + allKeywords.length * 8 + Math.min(30, normalized.length / 50)));

  return {
    score: Math.round(score * 100) / 100,
    label,
    urgency,
    confidence,
    keywordsFound: allKeywords
  };
}

export function computeThreatLevelFromSentiment(urgency: number): ThreatLevel {
  if (urgency >= 80) return 'CRITICAL';
  if (urgency >= 65) return 'HIGH';
  if (urgency >= 45) return 'ELEVATED';
  if (urgency >= 25) return 'GUARDED';
  return 'LOW';
}

export function calculateFleetThreatSummary(items: { sentiment: SentimentAnalysis; threatLevel: ThreatLevel }[]) {
  if (items.length === 0) {
    return {
      averageUrgency: 0,
      panicCount: 0,
      hostileCount: 0,
      criticalCount: 0,
      overallStatus: 'STABLE'
    };
  }

  let totalUrgency = 0;
  let panicCount = 0;
  let hostileCount = 0;
  let criticalCount = 0;

  for (const item of items) {
    totalUrgency += item.sentiment.urgency;
    if (item.sentiment.label === 'PANIC') panicCount++;
    if (item.sentiment.label === 'HOSTILE') hostileCount++;
    if (item.threatLevel === 'CRITICAL') criticalCount++;
  }

  const averageUrgency = Math.round(totalUrgency / items.length);
  const overallStatus = averageUrgency >= 70 ? 'CRITICAL_CONDITION' : averageUrgency >= 50 ? 'ELEVATED_RISK' : 'NORMAL_OPERATIONS';

  return {
    averageUrgency,
    panicCount,
    hostileCount,
    criticalCount,
    overallStatus
  };
}
