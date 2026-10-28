import { AttributionHypothesis } from '../types/osint';

interface ActorFingerprint {
  actorId: string;
  name: string;
  linguisticPatterns: string[];
  ttps: { id: string; name: string }[];
  malwareTooling: string[];
  targetSectors: string[];
  targetGeos: string[];
  infrastructureIndicators: string[];
  cryptoAffinity: string[];
  baseConfidence: number;
}

const ACTOR_FINGERPRINTS: ActorFingerprint[] = [
  {
    actorId: 'volt-typhoon',
    name: 'Volt Typhoon',
    linguisticPatterns: ['living off the land', 'lotl', 'fast reverse proxy', 'frp', 'webshell', 'cisco router', 'fortios'],
    ttps: [
      { id: 'T1078', name: 'Valid Accounts' },
      { id: 'T1059.001', name: 'PowerShell' },
      { id: 'T1071.001', name: 'Web Protocols HTTPS C2' },
      { id: 'T1021.001', name: 'Remote Desktop' }
    ],
    malwareTooling: ['certutil.exe', 'KV-Botnet', 'Sliver C2', 'Fast Reverse Proxy', 'wmic shadowcopy'],
    targetSectors: ['Energy/Grid', 'Maritime/Ports', 'Water Utilities', 'Defense'],
    targetGeos: ['Georgia', 'Florida', 'Savannah', 'Atlanta', 'Guam'],
    infrastructureIndicators: ['198.51.100.24', 'AS4134', 'SOHO router cluster', 'compromised netgear'],
    cryptoAffinity: ['OTC broker', 'USDT-TRC20'],
    baseConfidence: 94
  },
  {
    actorId: 'lockbit-3.0',
    name: 'LockBit 3.0',
    linguisticPatterns: ['lockbit', 'stealer', 'leak mirror', 'countdown', 'ransom note', 'decryptor', 'affiliate program', 'garant', 'гарант'],
    ttps: [
      { id: 'T1486', name: 'Data Encrypted for Impact' },
      { id: 'T1567', name: 'Exfiltration Over Web Service' },
      { id: 'T1070.004', name: 'File Deletion' },
      { id: 'T1566', name: 'Spearphishing Link' }
    ],
    malwareTooling: ['LockBit 3.0 Builder', 'StealBit', 'vssadmin delete', 'ps_exec'],
    targetSectors: ['Healthcare', 'Municipal/Gov', 'Finance', 'Logistics'],
    targetGeos: ['Florida', 'Georgia', 'Miami', 'Tampa', 'Atlanta'],
    infrastructureIndicators: ['185.220.101.5', 'onion mirror', 'tor hidden service', 'bulletproof hosting'],
    cryptoAffinity: ['XMR', 'Monero', 'BTC', 'bitcoin escrow'],
    baseConfidence: 91
  },
  {
    actorId: 'scattered-spider',
    name: 'Scattered Spider',
    linguisticPatterns: ['okta bypass', 'sim swap', 'mfa fatigue', 'vishing', 'helpdesk', 'azure ad', 'evilginx', 'starbucks card'],
    ttps: [
      { id: 'T1566.002', name: 'Spearphishing SMS (Smishing)' },
      { id: 'T1621', name: 'MFA Fatigue' },
      { id: 'T1098.005', name: 'Device Registration Hijacking' },
      { id: 'T1556.006', name: 'Modify Authentication Process' }
    ],
    malwareTooling: ['Evilginx3', 'Mimikatz', 'AnyDesk', 'RustDesk', 'Telegram C2 bot'],
    targetSectors: ['Telecommunications', 'Cloud Providers', 'Hospitality', 'Healthcare'],
    targetGeos: ['Florida', 'Miami', 'Orlando', 'Southeast US'],
    infrastructureIndicators: ['reverse proxy phishing', 'cloudflare worker', 'compromised residential IP'],
    cryptoAffinity: ['Crypto mixer', 'Tornado Cash', 'ETH'],
    baseConfidence: 89
  },
  {
    actorId: 'apt28',
    name: 'APT28 (Fancy Bear)',
    linguisticPatterns: ['gru', 'fancy bear', 'strontium', 'military intelligence', 'defense contractor', 'exploit zero-day'],
    ttps: [
      { id: 'T1190', name: 'Exploit Public-Facing Application' },
      { id: 'T1055', name: 'Process Injection' },
      { id: 'T1003', name: 'OS Credential Dumping' },
      { id: 'T1041', name: 'Exfiltration Over C2' }
    ],
    malwareTooling: ['GooseEgg', 'Zebrocy', 'Drovorub', 'Cobalt Strike Beacon'],
    targetSectors: ['Defense', 'Aviation', 'Government', 'Energy'],
    targetGeos: ['Georgia', 'Fort Eisenhower', 'Augusta', 'Florida', 'MacDill AFB'],
    infrastructureIndicators: ['compromised email server', 'covert DNS tunnel', 'dedicated VPS'],
    cryptoAffinity: ['BTC', 'privacy coins'],
    baseConfidence: 93
  }
];

export function performAttributionAnalysis(text: string, contextTarget?: string): AttributionHypothesis {
  const norm = (text + ' ' + (contextTarget || '')).toLowerCase();

  const scores: { actor: ActorFingerprint; score: number; evidence: AttributionHypothesis['corroboratingEvidence'] }[] = [];

  for (const fp of ACTOR_FINGERPRINTS) {
    let currentScore = 0;
    const evidence: AttributionHypothesis['corroboratingEvidence'] = [];

    // Check linguistic patterns
    for (const pattern of fp.linguisticPatterns) {
      if (norm.includes(pattern)) {
        currentScore += 18;
        evidence.push({
          category: 'LINGUISTIC',
          description: `Discourse matches adversary lexicon signature: "${pattern}"`,
          weight: 'HIGH'
        });
      }
    }

    // Check malware tooling
    for (const tool of fp.malwareTooling) {
      if (norm.includes(tool.toLowerCase())) {
        currentScore += 22;
        evidence.push({
          category: 'MITRE_TTP',
          description: `Payload signature matches known weaponized utility: "${tool}"`,
          weight: 'HIGH'
        });
      }
    }

    // Check targeted sectors
    for (const sec of fp.targetSectors) {
      if (norm.includes(sec.toLowerCase())) {
        currentScore += 14;
        evidence.push({
          category: 'TARGETING',
          description: `Target victim sector corresponds with known historical objective: "${sec}"`,
          weight: 'MED'
        });
      }
    }

    // Check targeted geography (Georgia / Florida corridor)
    for (const geo of fp.targetGeos) {
      if (norm.includes(geo.toLowerCase())) {
        currentScore += 16;
        evidence.push({
          category: 'TARGETING',
          description: `Victim geographical footprint matches operational focus: "${geo}"`,
          weight: 'HIGH'
        });
      }
    }

    // Check infrastructure matches
    for (const infra of fp.infrastructureIndicators) {
      if (norm.includes(infra.toLowerCase())) {
        currentScore += 20;
        evidence.push({
          category: 'INFRASTRUCTURE',
          description: `Network relay or host indicator correlated with actor C2: "${infra}"`,
          weight: 'HIGH'
        });
      }
    }

    // Check crypto / payment indicators
    for (const crypto of fp.cryptoAffinity) {
      if (norm.includes(crypto.toLowerCase())) {
        currentScore += 10;
        evidence.push({
          category: 'CRYPTO_FLOW',
          description: `Cryptocurrency or escrow payment vector match: "${crypto}"`,
          weight: 'LOW'
        });
      }
    }

    if (evidence.length > 0) {
      // Normalize confidence
      const confidence = Math.min(99, Math.max(35, Math.round((currentScore / 70) * fp.baseConfidence)));
      scores.push({ actor: fp, score: confidence, evidence });
    }
  }

  // Sort by highest confidence score
  scores.sort((a, b) => b.score - a.score);

  if (scores.length === 0) {
    // Fallback attribution
    return {
      primaryActor: 'Unattributed Threat Actor (Unknown Broker)',
      confidenceScore: 42,
      secondarySuspects: [
        { actorName: 'Emerging Ransomware Affiliate', score: 38 },
        { actorName: 'Initial Access Broker (IAB)', score: 32 }
      ],
      corroboratingEvidence: [
        {
          category: 'TARGETING',
          description: 'Broad scanning without proprietary adversary tool signatures detected',
          weight: 'LOW'
        }
      ],
      mitreTechniquesIdentified: ['T1190 - Exploit Public-Facing Application', 'T1078 - Valid Accounts'],
      recommendedDefenses: [
        'Enforce FIDO2 WebAuthn authentication on all edge access portals',
        'Scrub inbound traffic from non-reputable autonomous systems'
      ]
    };
  }

  const winner = scores[0];
  const secondary = scores.slice(1).map(s => ({ actorName: s.actor.name, score: Math.round(s.score * 0.75) }));

  const mitreTechniques = winner.actor.ttps.map(t => `${t.id} - ${t.name}`);

  const recommendedDefenses = [
    `Deploy strict perimeter firewall blocking for ${winner.actor.name} known C2 relays`,
    'Isolate OT/SCADA industrial controllers from corporate VLANs',
    'Revoke Active Directory Kerberos Golden Tickets and force password resets',
    'Activate real-time webhook broadcasts to Georgia & Florida Incident Response teams'
  ];

  return {
    primaryActor: winner.actor.name,
    confidenceScore: winner.score,
    secondarySuspects: secondary,
    corroboratingEvidence: winner.evidence,
    mitreTechniquesIdentified: mitreTechniques,
    recommendedDefenses
  };
}
