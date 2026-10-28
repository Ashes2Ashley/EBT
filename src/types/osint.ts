export type ThreatLevel = 'LOW' | 'GUARDED' | 'ELEVATED' | 'HIGH' | 'CRITICAL';

export type PriorityTier = 
  | 'P1_IMMINENT_CRITICAL' 
  | 'P2_HIGH_ALERT' 
  | 'P3_ELEVATED_WATCH' 
  | 'P4_INFORMATIONAL';

export type SourceCategory = 
  | 'PUBLIC_DB' 
  | 'SOCIAL_MEDIA' 
  | 'DARK_WEB' 
  | 'PASTE_LEAK' 
  | 'CISA_ADVISORY' 
  | 'SHODAN' 
  | 'TELEGRAM'
  | 'DARKWEB_FORUM'
  | 'ILLICIT_MARKET'
  | 'RANSOMWARE_DLS'
  | 'HONEYPOT_TELEMETRY'
  | 'EXPLOIT_POC';

export interface SentimentAnalysis {
  score: number; // -1.0 to 1.0
  label: 'PANIC' | 'HOSTILE' | 'ALARMING' | 'NEUTRAL';
  urgency: number; // 0 to 100
  confidence: number; // 0 to 100
  keywordsFound: string[];
}

export interface ThreatFactorBreakdown {
  actorReputationScore: number; // 0 - 100 (25%)
  impactScore: number; // 0 - 100 (30%)
  exploitabilityScore: number; // 0 - 100 (25%)
  geoRelevanceScore: number; // 0 - 100 (20%)
  dynamicAdjustmentBonus: number; // -20 to +30
}

export interface ThreatPrioritization {
  compositeScore: number; // 0 - 100
  priorityTier: PriorityTier;
  factors: ThreatFactorBreakdown;
  priorityReasons: string[];
  lastAdjustedTimestamp: string;
}

export interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  origin: string;
  motivation: 'FINANCIAL' | 'ESPIONAGE' | 'SABOTAGE' | 'HACKTIVISM';
  targetSectors: string[];
  targetedRegions: string[];
  mitreTechniques: string[];
  knownRansomware: string[];
  activeCampaigns: string;
  threatScore: number;
  confidence: number;
  lastActivity: string;
  linguisticMarkers?: string[];
  cryptoWallets?: string[];
  yaraRuleSample?: string;
  sigmaRuleSample?: string;
}

export interface ThreatGeoTarget {
  state: 'Georgia' | 'Florida' | 'Multi-State' | 'Global';
  city: string;
  coordinates: [number, number]; // [lat, lng]
  facilityName: string;
  sector: 'Energy/Grid' | 'Maritime/Ports' | 'Healthcare' | 'Municipal/Gov' | 'Defense' | 'Finance' | 'Aviation';
}

export interface FeedItem {
  id: string;
  title: string;
  content: string;
  sourceName: string;
  sourceCategory: SourceCategory;
  timestamp: string;
  threatLevel: ThreatLevel;
  sentiment: SentimentAnalysis;
  targetGeo?: ThreatGeoTarget;
  attributedActor?: string;
  indicatorsOfCompromise: string[];
  verified: boolean;
  rawUrl?: string;
  prioritization?: ThreatPrioritization;
  forumAuthor?: string;
  priceTag?: string;
  darkWebForum?: string;
}

export interface DarkWebForumThread {
  id: string;
  forumName: 'BreachForums v3' | 'Exploit.in' | 'XSS.is' | 'Russian Market' | 'Genesis Store clone' | 'LockBit 3.0 DLS' | 'Dread' | '2easy Shop' | 'Brian\'s Club' | 'BlackCat DLS';
  threadCategory: '0-DAY_EXPLOIT' | 'STOLEN_DATA' | 'INITIAL_ACCESS' | 'BOT_STEALER_LOGS' | 'RANSOMWARE_AUCTION';
  title: string;
  authorHandle: string;
  authorReputation: string;
  timestamp: string;
  price: string;
  currency: 'XMR' | 'BTC' | 'USD';
  escrowStatus: 'ESCROW_GUARANTEED' | 'DIRECT_SALE' | 'AUCTION_BIDDING';
  threatLevel: ThreatLevel;
  prioritization: ThreatPrioritization;
  targetRegion: 'Georgia' | 'Florida' | 'Southeast US' | 'Global';
  targetSector: string;
  rawPostText: string;
  redactedProofSample: string;
  indicators: string[];
  attributedActorCandidate?: string;
  attributionConfidence?: number;
  relevantToSoutheast: boolean;
}

export interface AttributionHypothesis {
  primaryActor: string;
  confidenceScore: number;
  secondarySuspects: { actorName: string; score: number }[];
  corroboratingEvidence: {
    category: 'LINGUISTIC' | 'MITRE_TTP' | 'INFRASTRUCTURE' | 'TARGETING' | 'CRYPTO_FLOW';
    description: string;
    weight: 'HIGH' | 'MED' | 'LOW';
  }[];
  mitreTechniquesIdentified: string[];
  recommendedDefenses: string[];
}

export interface MapAsset {
  id: string;
  name: string;
  state: 'Georgia' | 'Florida';
  city: string;
  county?: string;
  sector: 'Energy/Grid' | 'Maritime/Ports' | 'Healthcare' | 'Municipal/Gov' | 'Defense' | 'Finance' | 'Aviation';
  coordinates: [number, number]; // [lat, lng]
  currentStatus: 'SECURE' | 'UNDER_ATTACK' | 'PROBING_DETECTED' | 'MITIGATING';
  activeThreatCount: number;
  cveImpacted?: string;
  incomingVector?: {
    originCountry: string;
    originCity: string;
    originCoords: [number, number];
    actor: string;
    vectorType: string;
  };
}

export interface CountyThreatMetric {
  countyName: string;
  state: 'Georgia' | 'Florida';
  threatIndex: number; // 0 - 100
  criticalAssetCount: number;
  activeAttacks: number;
  status: 'ELEVATED' | 'CRITICAL' | 'NORMAL';
}

export interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  channels: ('discord' | 'slack' | 'email')[];
  minThreatLevel: ThreatLevel;
  stateFilter: 'All' | 'Georgia' | 'Florida';
  panicSentimentOnly: boolean;
  keywords: string[];
  webhookUrlDiscord?: string;
  webhookUrlSlack?: string;
  alertEmail?: string;
}

export interface AlertDispatchRecord {
  id: string;
  timestamp: string;
  channel: 'discord' | 'slack' | 'email';
  title: string;
  recipient: string;
  status: 'SENT' | 'DELIVERED' | 'SIMULATED' | 'FAILED';
  latencyMs: number;
  payloadPreview: string;
}

export interface IncidentTicket {
  id: string;
  title: string;
  severity: ThreatLevel;
  status: 'OPEN' | 'TRIAGED' | 'CONTAINMENT_IN_PROGRESS' | 'RESOLVED';
  affectedState: 'Georgia' | 'Florida' | 'Multi-State';
  facility: string;
  assignedUnit: string;
  threatActor?: string;
  createdTime: string;
  cve?: string;
  notes: string[];
}

export interface PacketRecord {
  id: string;
  timestamp: string;
  srcIp: string;
  srcPort: number;
  dstIp: string;
  dstPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'TLS';
  flags: string;
  lengthBytes: number;
  payloadAscii: string;
  payloadHex: string;
  isMalicious: boolean;
  ruleTriggered?: string;
}

export interface DnsRecord {
  type: 'A' | 'AAAA' | 'MX' | 'TXT' | 'NS' | 'SOA' | 'CNAME';
  value: string;
  ttl: number;
}

export interface WhoisResult {
  domain: string;
  registrar: string;
  createdDate: string;
  expiresDate: string;
  nameservers: string[];
  registrantOrg: string;
  country: string;
}

export interface CryptoWalletTracing {
  address: string;
  currency: 'BTC' | 'XMR' | 'USDT';
  balance: string;
  riskScore: number;
  clusterLabel: string;
  ransomwareTaint: string;
  transactionCount: number;
  isSanctionedOfac: boolean;
  recentHops: { txHash: string; amount: string; timestamp: string; destination: string; hopType: 'MIXER' | 'EXCHANGE' | 'WALLET' }[];
}

export type UserRole = 'ADMIN' | 'SOC_COMMANDER' | 'CYBER_ANALYST';

export interface PhoneAuthUser {
  phoneNumber: string;
  role: UserRole;
  adminLevel: 'SOC_COMMANDER' | 'CYBER_ANALYST' | 'INCIDENT_RESPONDER';
  authenticated: boolean;
  agency: string;
  location?: string;
  authTimestamp?: string;
  passkeyVerified?: boolean;
  token?: string;
  sessionExpiresAt?: number;
}

export interface AuthAuditRecord {
  id: string;
  timestamp: string;
  phoneNumber: string;
  action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'SESSION_LOCKED' | 'PASSKEY_VERIFIED';
  role: string;
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'DENIED' | 'RATE_LIMITED';
}

export interface IpPortInfo {
  port: number;
  service: string;
  banner?: string;
  risk: 'LOW' | 'MED' | 'HIGH';
}

export interface IpBlacklistCheck {
  name: string;
  listed: boolean;
  category: string;
  details?: string;
}

export interface IpLookupResult {
  ip: string;
  hostname?: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  asn: string;
  isp: string;
  org: string;
  threatScore: number;
  abuseScore: number;
  isTorExit: boolean;
  isVpnProxy: boolean;
  isKnownC2: boolean;
  isGeorgiaFloridaTarget?: boolean;
  openPorts: IpPortInfo[];
  blacklists: IpBlacklistCheck[];
  associatedThreatActor?: string;
  lastSeenAttack: string;
  dnsRecords?: DnsRecord[];
  whois?: WhoisResult;
}
