import { PriorityTier, ThreatFactorBreakdown, ThreatPrioritization } from '../types/osint';

// High-profile threat actor reputation weights
const ACTOR_REPUTATION_WEIGHTS: Record<string, number> = {
  'volt typhoon': 98,
  'bronze silhouette': 98,
  'vanguard panda': 98,
  'apt28': 95,
  'fancy bear': 95,
  'gru': 95,
  'lockbit 3.0': 92,
  'lockbit': 92,
  'scattered spider': 90,
  'unc3944': 90,
  'blackcat': 88,
  'alphv': 88,
  'lazarus': 94,
  'akira': 86,
  'play ransomware': 85,
  'bianlian': 84
};

export function calculateThreatActorReputationScore(actorName?: string, content = ''): number {
  if (actorName) {
    const key = actorName.toLowerCase().trim();
    for (const [knownActor, score] of Object.entries(ACTOR_REPUTATION_WEIGHTS)) {
      if (key.includes(knownActor)) return score;
    }
  }

  const normalized = content.toLowerCase();
  for (const [knownActor, score] of Object.entries(ACTOR_REPUTATION_WEIGHTS)) {
    if (normalized.includes(knownActor)) return score;
  }

  if (normalized.includes('nation-state') || normalized.includes('apt') || normalized.includes('state-sponsored')) {
    return 88;
  }
  if (normalized.includes('ransomware') || normalized.includes('extortion') || normalized.includes('syndicate')) {
    return 80;
  }
  if (normalized.includes('broker') || normalized.includes('seller') || normalized.includes('vip seller')) {
    return 72;
  }

  return 50; // Baseline for unknown or unverified actors
}

export function calculatePotentialImpactScore(sector?: string, content = ''): number {
  const normContent = content.toLowerCase();

  // Sector-based baseline
  let score = 55;
  if (sector) {
    switch (sector) {
      case 'Energy/Grid':
        score = 98;
        break;
      case 'Maritime/Ports':
        score = 94;
        break;
      case 'Defense':
        score = 95;
        break;
      case 'Aviation':
        score = 92;
        break;
      case 'Healthcare':
        score = 90;
        break;
      case 'Municipal/Gov':
        score = 84;
        break;
      case 'Finance':
        score = 80;
        break;
      default:
        score = 65;
    }
  }

  // Keywords boosting impact
  if (normContent.includes('nuclear') || normContent.includes('blackout') || normContent.includes('scada') || normContent.includes('grid collapse')) {
    score = Math.max(score, 99);
  } else if (normContent.includes('port') || normContent.includes('supply chain') || normContent.includes('freight')) {
    score = Math.max(score, 93);
  } else if (normContent.includes('hospital') || normContent.includes('hipaa') || normContent.includes('patient records')) {
    score = Math.max(score, 89);
  } else if (normContent.includes('active directory') || normContent.includes('domain admin') || normContent.includes('credentials')) {
    score = Math.max(score, 82);
  }

  return Math.min(100, Math.max(10, score));
}

export function calculateExploitabilityScore(content = '', cve = ''): number {
  const combined = (content + ' ' + cve).toLowerCase();

  if (combined.includes('0-day') || combined.includes('zero-day') || combined.includes('pre-auth rce') || combined.includes('unauthenticated rce')) {
    return 98;
  }
  if (combined.includes('poc exploit') || combined.includes('weaponized') || combined.includes('in the wild') || combined.includes('cisa kev')) {
    return 92;
  }
  if (combined.includes('cve-') || combined.includes('buffer overflow') || combined.includes('privilege escalation')) {
    return 84;
  }
  if (combined.includes('stealer log') || combined.includes('session cookie') || combined.includes('token replay') || combined.includes('credential stuffing')) {
    return 76;
  }
  if (combined.includes('port scan') || combined.includes('reconnaissance') || combined.includes('probe')) {
    return 55;
  }

  return 50;
}

export function calculateGeoRelevanceScore(state?: string, city?: string, content = ''): number {
  const norm = ((state || '') + ' ' + (city || '') + ' ' + content).toLowerCase();

  const isGeorgia = 
    norm.includes('georgia') || 
    norm.includes('atlanta') || 
    norm.includes('savannah') || 
    norm.includes('augusta') || 
    norm.includes('vogtle') || 
    norm.includes('kings bay') ||
    norm.includes('.ga.gov');

  const isFlorida = 
    norm.includes('florida') || 
    norm.includes('miami') || 
    norm.includes('tampa') || 
    norm.includes('orlando') || 
    norm.includes('jacksonville') || 
    norm.includes('tallahassee') || 
    norm.includes('turkey point') || 
    norm.includes('cape canaveral') ||
    norm.includes('.myflorida.com');

  if (isGeorgia && isFlorida) return 100;
  if (isGeorgia || isFlorida) return 96;
  if (norm.includes('southeast') || norm.includes('east coast') || norm.includes('interstate 95')) return 78;
  if (norm.includes('united states') || norm.includes('u.s.') || norm.includes('federal')) return 60;

  return 30; // Global or unrelated region
}

export interface DynamicSignalInput {
  c2Active?: boolean;
  darkWebAuctionActive?: boolean;
  sampleVerified?: boolean;
  liveAttackInProgress?: boolean;
  emergencyBroadcastTriggered?: boolean;
}

export function calculateDynamicAdjustmentBonus(signals?: DynamicSignalInput): number {
  if (!signals) return 0;
  let bonus = 0;
  if (signals.liveAttackInProgress) bonus += 15;
  if (signals.darkWebAuctionActive) bonus += 10;
  if (signals.c2Active) bonus += 12;
  if (signals.sampleVerified) bonus += 8;
  if (signals.emergencyBroadcastTriggered) bonus += 10;
  return Math.min(30, bonus);
}

/**
 * Core dynamic threat prioritization calculator
 */
export function evaluateThreatPrioritization(params: {
  actorName?: string;
  sector?: string;
  content: string;
  cve?: string;
  state?: string;
  city?: string;
  signals?: DynamicSignalInput;
}): ThreatPrioritization {
  const actorReputationScore = calculateThreatActorReputationScore(params.actorName, params.content);
  const impactScore = calculatePotentialImpactScore(params.sector, params.content);
  const exploitabilityScore = calculateExploitabilityScore(params.content, params.cve);
  const geoRelevanceScore = calculateGeoRelevanceScore(params.state, params.city, params.content);
  const dynamicAdjustmentBonus = calculateDynamicAdjustmentBonus(params.signals);

  // Weighted formula:
  // Actor Reputation: 25%
  // Impact Score: 30%
  // Exploitability: 25%
  // Geo Relevance (GA & FL): 20%
  // Plus dynamic adjustment bonus
  const baseScore = 
    0.25 * actorReputationScore +
    0.30 * impactScore +
    0.25 * exploitabilityScore +
    0.20 * geoRelevanceScore;

  const compositeScore = Math.min(100, Math.round(baseScore + dynamicAdjustmentBonus));

  let priorityTier: PriorityTier = 'P4_INFORMATIONAL';
  if (compositeScore >= 88) {
    priorityTier = 'P1_IMMINENT_CRITICAL';
  } else if (compositeScore >= 72) {
    priorityTier = 'P2_HIGH_ALERT';
  } else if (compositeScore >= 52) {
    priorityTier = 'P3_ELEVATED_WATCH';
  }

  const priorityReasons: string[] = [];
  if (geoRelevanceScore >= 90) {
    priorityReasons.push('Direct target match in Georgia / Florida critical sector');
  }
  if (actorReputationScore >= 88) {
    priorityReasons.push(`High adversary capability (${params.actorName || 'Tier-1 Threat Group'})`);
  }
  if (impactScore >= 90) {
    priorityReasons.push(`High impact to essential services (${params.sector || 'Critical Infrastructure'})`);
  }
  if (exploitabilityScore >= 90) {
    priorityReasons.push('Weaponized active exploit / Zero-Day in the wild');
  }
  if (dynamicAdjustmentBonus > 0) {
    priorityReasons.push(`Real-time escalation signals active (+${dynamicAdjustmentBonus} pts)`);
  }

  const factors: ThreatFactorBreakdown = {
    actorReputationScore,
    impactScore,
    exploitabilityScore,
    geoRelevanceScore,
    dynamicAdjustmentBonus
  };

  return {
    compositeScore,
    priorityTier,
    factors,
    priorityReasons,
    lastAdjustedTimestamp: new Date().toISOString()
  };
}

/**
 * Dynamically adjusts existing prioritization as new telemetry or signals emerge
 */
export function dynamicallyAdjustThreatPriority(
  current: ThreatPrioritization,
  newSignals: DynamicSignalInput,
  escalationNote?: string
): ThreatPrioritization {
  const updatedBonus = calculateDynamicAdjustmentBonus({
    ...newSignals,
    liveAttackInProgress: newSignals.liveAttackInProgress ?? (current.factors.dynamicAdjustmentBonus >= 15)
  });

  const baseScore = 
    0.25 * current.factors.actorReputationScore +
    0.30 * current.factors.impactScore +
    0.25 * current.factors.exploitabilityScore +
    0.20 * current.factors.geoRelevanceScore;

  const newComposite = Math.min(100, Math.round(baseScore + updatedBonus));

  let priorityTier: PriorityTier = 'P4_INFORMATIONAL';
  if (newComposite >= 88) {
    priorityTier = 'P1_IMMINENT_CRITICAL';
  } else if (newComposite >= 72) {
    priorityTier = 'P2_HIGH_ALERT';
  } else if (newComposite >= 52) {
    priorityTier = 'P3_ELEVATED_WATCH';
  }

  const updatedReasons = [...current.priorityReasons];
  if (escalationNote && !updatedReasons.includes(escalationNote)) {
    updatedReasons.unshift(escalationNote);
  }

  return {
    compositeScore: newComposite,
    priorityTier,
    factors: {
      ...current.factors,
      dynamicAdjustmentBonus: updatedBonus
    },
    priorityReasons: updatedReasons,
    lastAdjustedTimestamp: new Date().toISOString()
  };
}
