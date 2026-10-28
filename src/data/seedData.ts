import { FeedItem, ThreatActor, MapAsset, AlertRule, PhoneAuthUser } from '../types/osint';

export const THREAT_ACTORS: ThreatActor[] = [
  {
    id: 'actor-volt-typhoon',
    name: 'Volt Typhoon',
    aliases: ['Bronze Silhouette', 'Vanguard Panda', 'Insidious Taurus'],
    origin: 'People\'s Republic of China (State-Sponsored)',
    motivation: 'SABOTAGE',
    targetSectors: ['Energy/Grid', 'Maritime/Ports', 'Water Utilities', 'Defense'],
    targetedRegions: ['Georgia', 'Florida', 'Guam', 'Southeast US'],
    mitreTechniques: [
      'T1078 - Valid Accounts',
      'T1059.001 - PowerShell Living-off-the-land',
      'T1021.001 - Remote Desktop Protocol',
      'T1071.001 - Web Protocols (HTTPS C2)',
      'T1498 - Network Denial of Service'
    ],
    knownRansomware: ['Custom Web Shells', 'KV-Botnet', 'Fast Reverse Proxy'],
    activeCampaigns: 'Operation Crimson Tide: Persistent prepositioning in southeastern maritime port SCADA and municipal power routers.',
    threatScore: 96,
    confidence: 94,
    lastActivity: '12 minutes ago'
  },
  {
    id: 'actor-lockbit',
    name: 'LockBit 3.0',
    aliases: ['LockBit Black', 'Bitwise Spider'],
    origin: 'Eastern Europe / Transnational Syndicate',
    motivation: 'FINANCIAL',
    targetSectors: ['Healthcare', 'Municipal/Gov', 'Finance', 'Logistics'],
    targetedRegions: ['Florida', 'Georgia', 'Global'],
    mitreTechniques: [
      'T1486 - Data Encrypted for Impact',
      'T1566 - Phishing Spearphishing Link',
      'T1070.004 - File Deletion',
      'T1567 - Exfiltration Over Web Service'
    ],
    knownRansomware: ['LockBit 3.0 Builder', 'StealBit Exfiltrator'],
    activeCampaigns: 'Double-extortion targeting regional hospital systems in Greater Atlanta and Tampa Bay.',
    threatScore: 92,
    confidence: 91,
    lastActivity: '34 minutes ago'
  },
  {
    id: 'actor-scattered-spider',
    name: 'Scattered Spider',
    aliases: ['UNC3944', 'Octo Tempest', 'Muddled Libra'],
    origin: 'US / UK / Canada (Native English Speaking Cybercrime)',
    motivation: 'FINANCIAL',
    targetSectors: ['Telecommunications', 'Cloud Providers', 'Hospitality', 'Finance'],
    targetedRegions: ['Florida (Miami/Orlando)', 'Georgia', 'North America'],
    mitreTechniques: [
      'T1566.002 - Spearphishing SMS (Smishing)',
      'T1621 - Multi-Factor Authentication Request Generation (MFA Fatigue)',
      'T1098.005 - Device Registration Hijacking',
      'T1556.006 - Modify Authentication Process'
    ],
    knownRansomware: ['BlackCat / ALPHV affiliate', 'RansomHub'],
    activeCampaigns: 'Helpdesk vishing and SIM-swap operations targeting regional carrier infrastructure in South Florida.',
    threatScore: 89,
    confidence: 88,
    lastActivity: '1 hour ago'
  },
  {
    id: 'actor-apt28',
    name: 'APT28',
    aliases: ['Fancy Bear', 'STRONTIUM', 'Sofacy', 'Pawn Storm'],
    origin: 'Russian Federation (GRU Main Intelligence Directorate)',
    motivation: 'ESPIONAGE',
    targetSectors: ['Defense', 'Aviation', 'Government', 'Energy'],
    targetedRegions: ['Georgia (Fort Eisenhower corridor)', 'Florida (CENTCOM/MacDill)', 'NATO'],
    mitreTechniques: [
      'T1190 - Exploit Public-Facing Application',
      'T1055 - Process Injection',
      'T1003 - OS Credential Dumping',
      'T1041 - Exfiltration Over C2 Channel'
    ],
    knownRansomware: ['GooseEgg', 'Zebrocy', 'Drovorub'],
    activeCampaigns: 'Targeting defense contractors supporting Fort Eisenhower Cyber COE and Cape Canaveral launch systems.',
    threatScore: 94,
    confidence: 92,
    lastActivity: '2 hours ago'
  },
  {
    id: 'actor-blackcat',
    name: 'BlackCat / ALPHV',
    aliases: ['ALPHV', 'Noberus'],
    origin: 'Transnational Cybercriminal Network',
    motivation: 'FINANCIAL',
    targetSectors: ['Healthcare', 'Critical Manufacturing', 'Supply Chain'],
    targetedRegions: ['Georgia', 'Florida', 'East Coast'],
    mitreTechniques: [
      'T1486 - Data Encrypted for Impact',
      'T1562.001 - Disable or Modify Tools',
      'T1078.004 - Cloud Accounts'
    ],
    knownRansomware: ['ALPHV Rust-based Encryptor', 'Exmatter'],
    activeCampaigns: 'Healthcare billing switch exfiltration and dark web database publication.',
    threatScore: 86,
    confidence: 85,
    lastActivity: '4 hours ago'
  }
];

export const GEORGIA_FLORIDA_ASSETS: MapAsset[] = [
  // Georgia Assets
  {
    id: 'asset-ga-savannah-port',
    name: 'Port of Savannah - Garden City Terminal',
    state: 'Georgia',
    city: 'Savannah',
    sector: 'Maritime/Ports',
    coordinates: [32.1315, -81.1444],
    currentStatus: 'UNDER_ATTACK',
    activeThreatCount: 4,
    cveImpacted: 'CVE-2024-3400 (Palo Alto GlobalProtect Zero-Day)',
    incomingVector: {
      originCountry: 'China',
      originCity: 'Shenzhen',
      originCoords: [22.5431, 114.0579],
      actor: 'Volt Typhoon',
      vectorType: 'Living-off-the-land port switch hijacking'
    }
  },
  {
    id: 'asset-ga-plant-vogtle',
    name: 'Plant Vogtle Nuclear Generating Station',
    state: 'Georgia',
    city: 'Waynesboro / Augusta',
    sector: 'Energy/Grid',
    coordinates: [33.1425, -81.7633],
    currentStatus: 'MITIGATING',
    activeThreatCount: 2,
    cveImpacted: 'CVE-2023-38545 (SOCKS5 Buffer Overflow Probe)',
    incomingVector: {
      originCountry: 'Russia',
      originCity: 'St. Petersburg',
      originCoords: [59.9343, 30.3351],
      actor: 'APT28',
      vectorType: 'SCADA perimeter reconnaissance'
    }
  },
  {
    id: 'asset-ga-atlanta-airport',
    name: 'Hartsfield-Jackson Atlanta International Airport',
    state: 'Georgia',
    city: 'Atlanta',
    sector: 'Aviation',
    coordinates: [33.6407, -84.4277],
    currentStatus: 'PROBING_DETECTED',
    activeThreatCount: 3,
    cveImpacted: 'CVE-2024-21887 (Ivanti Connect Secure Zero-Day)'
  },
  {
    id: 'asset-ga-power-hq',
    name: 'Georgia Power Southeast Distribution Grid Node',
    state: 'Georgia',
    city: 'Atlanta',
    sector: 'Energy/Grid',
    coordinates: [33.7712, -84.3855],
    currentStatus: 'UNDER_ATTACK',
    activeThreatCount: 5,
    cveImpacted: 'CVE-2024-27198 (JetBrains TeamCity Auth Bypass)',
    incomingVector: {
      originCountry: 'Iran',
      originCity: 'Tehran',
      originCoords: [35.6892, 51.3890],
      actor: 'Pewter Gemini',
      vectorType: 'DDoS flooding & substation relay probing'
    }
  },
  {
    id: 'asset-ga-fort-eisenhower',
    name: 'Fort Eisenhower - US Army Cyber Center of Excellence',
    state: 'Georgia',
    city: 'Augusta',
    sector: 'Defense',
    coordinates: [33.3653, -82.1747],
    currentStatus: 'SECURE',
    activeThreatCount: 1,
    cveImpacted: 'Zero-trust perimeter active: 1,840 automated probes deflected'
  },
  {
    id: 'asset-ga-kings-bay',
    name: 'Naval Submarine Base Kings Bay',
    state: 'Georgia',
    city: 'St. Marys / Camden',
    sector: 'Defense',
    coordinates: [30.7989, -81.5367],
    currentStatus: 'SECURE',
    activeThreatCount: 0
  },
  {
    id: 'asset-ga-emory-health',
    name: 'Emory University Healthcare Regional Network',
    state: 'Georgia',
    city: 'Atlanta',
    sector: 'Healthcare',
    coordinates: [33.7925, -84.3245],
    currentStatus: 'PROBING_DETECTED',
    activeThreatCount: 2,
    cveImpacted: 'CVE-2024-1709 (ConnectWise ScreenConnect RCE)'
  },

  // Florida Assets
  {
    id: 'asset-fl-port-miami',
    name: 'PortMiami Maritime Logistics Hub',
    state: 'Florida',
    city: 'Miami',
    sector: 'Maritime/Ports',
    coordinates: [25.7781, -80.1774],
    currentStatus: 'UNDER_ATTACK',
    activeThreatCount: 6,
    cveImpacted: 'CVE-2024-3400 & LockBit 3.0 Phishing Cluster',
    incomingVector: {
      originCountry: 'Eastern Europe / Tor',
      originCity: 'Bulletproof Node',
      originCoords: [52.5200, 13.4050],
      actor: 'LockBit 3.0',
      vectorType: 'Supply chain EDI manifest ransomware injection'
    }
  },
  {
    id: 'asset-fl-cape-canaveral',
    name: 'Cape Canaveral Space Force Station & KSC',
    state: 'Florida',
    city: 'Cape Canaveral',
    sector: 'Defense',
    coordinates: [28.4889, -80.5778],
    currentStatus: 'PROBING_DETECTED',
    activeThreatCount: 2,
    cveImpacted: 'RF & Telemetry spectrum scanning detected'
  },
  {
    id: 'asset-fl-macdill-afb',
    name: 'MacDill Air Force Base - US CENTCOM HQ',
    state: 'Florida',
    city: 'Tampa',
    sector: 'Defense',
    coordinates: [27.8493, -82.5211],
    currentStatus: 'SECURE',
    activeThreatCount: 1
  },
  {
    id: 'asset-fl-turkey-point',
    name: 'FPL Turkey Point Clean Energy & Nuclear Plant',
    state: 'Florida',
    city: 'Homestead / Miami-Dade',
    sector: 'Energy/Grid',
    coordinates: [25.4353, -80.3311],
    currentStatus: 'MITIGATING',
    activeThreatCount: 3,
    cveImpacted: 'CVE-2024-21893 (Ivanti SSRF vulnerability)'
  },
  {
    id: 'asset-fl-jacksonville-mayport',
    name: 'Naval Station Mayport & Port of Jacksonville',
    state: 'Florida',
    city: 'Jacksonville',
    sector: 'Maritime/Ports',
    coordinates: [30.3958, -81.4283],
    currentStatus: 'PROBING_DETECTED',
    activeThreatCount: 2
  },
  {
    id: 'asset-fl-tampa-hospital',
    name: 'Tampa General Regional Medical Complex',
    state: 'Florida',
    city: 'Tampa',
    sector: 'Healthcare',
    coordinates: [27.9392, -82.4578],
    currentStatus: 'UNDER_ATTACK',
    activeThreatCount: 4,
    cveImpacted: 'CVE-2023-4966 (Citrix Bleed Token Replay)',
    incomingVector: {
      originCountry: 'Transnational',
      originCity: 'Rotterdam Proxy',
      originCoords: [51.9244, 4.4777],
      actor: 'Scattered Spider',
      vectorType: 'Okta SSO session credential theft'
    }
  },
  {
    id: 'asset-fl-tallahassee-eoc',
    name: 'Florida Division of Emergency Management HQ',
    state: 'Florida',
    city: 'Tallahassee',
    sector: 'Municipal/Gov',
    coordinates: [30.4383, -84.2807],
    currentStatus: 'SECURE',
    activeThreatCount: 1
  },
  {
    id: 'asset-fl-orlando-hub',
    name: 'Greater Orlando Aviation & Telemetry Grid',
    state: 'Florida',
    city: 'Orlando',
    sector: 'Aviation',
    coordinates: [28.4312, -81.3081],
    currentStatus: 'PROBING_DETECTED',
    activeThreatCount: 2
  }
];

export const INITIAL_FEED_ITEMS: FeedItem[] = [
  {
    id: 'feed-001',
    title: 'Volt Typhoon Infiltrating Georgia Regional Maritime Terminals',
    content: 'CISA advisory AA24-038A: Threat actor Volt Typhoon has maintained stealth persistence in Cisco and Fortinet edge switches in the Port of Savannah logistics corridor. Living-off-the-land commands detected extracting network topology.',
    sourceName: 'CISA KEV Bulletin & Telemetry',
    sourceCategory: 'CISA_ADVISORY',
    timestamp: '2 min ago',
    threatLevel: 'CRITICAL',
    sentiment: {
      score: -0.92,
      label: 'PANIC',
      urgency: 95,
      confidence: 96,
      keywordsFound: ['zero-day', 'imminent', 'compromised', 'scada', 'threat actor']
    },
    targetGeo: {
      state: 'Georgia',
      city: 'Savannah',
      coordinates: [32.1315, -81.1444],
      facilityName: 'Port of Savannah - Garden City Terminal',
      sector: 'Maritime/Ports'
    },
    attributedActor: 'Volt Typhoon',
    indicatorsOfCompromise: ['198.51.100.24', 'certutil.exe -urlcache -split', 'beacon_sha256:7f83b1657ff1...'],
    verified: true
  },
  {
    id: 'feed-002',
    title: 'LockBit 3.0 Claims Exfiltration of 850GB Miami Healthcare Patient Records',
    content: 'LockBit extortion leak mirror published a countdown timer targeting South Florida healthcare network. Claims 850GB of HIPAA files, employee PII, and financial ledgers encrypted.',
    sourceName: 'Tor .onion LockBit Leak Mirror',
    sourceCategory: 'DARK_WEB',
    timestamp: '7 min ago',
    threatLevel: 'CRITICAL',
    sentiment: {
      score: -0.88,
      label: 'PANIC',
      urgency: 92,
      confidence: 94,
      keywordsFound: ['ransomware', 'extortion', 'leak dump', 'breached']
    },
    targetGeo: {
      state: 'Florida',
      city: 'Miami',
      coordinates: [25.7781, -80.1774],
      facilityName: 'PortMiami & South Florida Hospital Network',
      sector: 'Healthcare'
    },
    attributedActor: 'LockBit 3.0',
    indicatorsOfCompromise: ['lockbit3_decryptor_key.bin', '185.220.101.5', 'tor://lockbitapt2...onion'],
    verified: true
  },
  {
    id: 'feed-003',
    title: 'X / Twitter Intel Alert: Targeted Phishing Wave Against Atlanta Transit Auth',
    content: 'Threat researchers on X report fresh reverse proxy phishing kits (Evilginx3) harvesting Okta session cookies belonging to Georgia municipal infrastructure engineers.',
    sourceName: 'Twitter/X #threatintel',
    sourceCategory: 'SOCIAL_MEDIA',
    timestamp: '14 min ago',
    threatLevel: 'HIGH',
    sentiment: {
      score: -0.65,
      label: 'HOSTILE',
      urgency: 74,
      confidence: 88,
      keywordsFound: ['phishing', 'spoofed', 'exploit', 'infiltrate']
    },
    targetGeo: {
      state: 'Georgia',
      city: 'Atlanta',
      coordinates: [33.7490, -84.3880],
      facilityName: 'Atlanta Regional Transit & Power HQ',
      sector: 'Municipal/Gov'
    },
    attributedActor: 'Scattered Spider',
    indicatorsOfCompromise: ['sso-auth-atlantaga[.]net', 'evilginx_token_hook:8080'],
    verified: false
  },
  {
    id: 'feed-004',
    title: 'Dark Web Telegram Dump: Substation SCADA Diagrams Auctioned for $15,000',
    content: 'Russian language underground Telegram channel "Ex-Corridor" posted watermarked technical blue prints for Southeast US grid interconnections near Augusta & Savannah.',
    sourceName: 'Telegram Cyber Underworld Channel',
    sourceCategory: 'TELEGRAM',
    timestamp: '21 min ago',
    threatLevel: 'HIGH',
    sentiment: {
      score: -0.78,
      label: 'HOSTILE',
      urgency: 82,
      confidence: 85,
      keywordsFound: ['scada', 'blackout', 'leak dump', 'threat actor']
    },
    targetGeo: {
      state: 'Georgia',
      city: 'Waynesboro / Augusta',
      coordinates: [33.1425, -81.7633],
      facilityName: 'Plant Vogtle Nuclear Facility & Grid Nodes',
      sector: 'Energy/Grid'
    },
    attributedActor: 'Unknown Broker (Russian Market)',
    indicatorsOfCompromise: ['sha256:d41d8cd98f00b204e9800998ecf8427e', 'telegram://t.me/shadow_corridor_leaks'],
    verified: true
  },
  {
    id: 'feed-005',
    title: 'Shodan Mass-Scan Discovering Exposed RDP & Modbus Endpoints in Tampa Bay',
    content: 'Automated telemetry detected continuous reconnaissance on port 502 (Modbus) and port 3389 across Tampa water utility subnets originating from bulletproof hosting in Western Europe.',
    sourceName: 'Shodan Stream Engine & Censys',
    sourceCategory: 'SHODAN',
    timestamp: '29 min ago',
    threatLevel: 'ELEVATED',
    sentiment: {
      score: -0.45,
      label: 'ALARMING',
      urgency: 58,
      confidence: 90,
      keywordsFound: ['scanning', 'probe', 'vulnerability', 'anomalous']
    },
    targetGeo: {
      state: 'Florida',
      city: 'Tampa',
      coordinates: [27.9506, -82.4572],
      facilityName: 'Tampa Bay Water Distribution Core',
      sector: 'Energy/Grid'
    },
    indicatorsOfCompromise: ['167.99.145.82', 'syn-scan-modbus:502'],
    verified: true
  },
  {
    id: 'feed-006',
    title: 'Pastebin Dump: Exposed API Keys for Florida Emergency Response Fleet',
    content: 'Ghostbin mirror contains leaked credentials including AWS S3 access keys and Twilio SMS dispatch keys tagged with Florida Emergency Services project identifiers.',
    sourceName: 'Pastebin / Ghostbin Scraper',
    sourceCategory: 'PASTE_LEAK',
    timestamp: '38 min ago',
    threatLevel: 'HIGH',
    sentiment: {
      score: -0.72,
      label: 'HOSTILE',
      urgency: 78,
      confidence: 92,
      keywordsFound: ['leak dump', 'compromised', 'bypass', 'unauthorized']
    },
    targetGeo: {
      state: 'Florida',
      city: 'Tallahassee',
      coordinates: [30.4383, -84.2807],
      facilityName: 'Florida Division of Emergency Management HQ',
      sector: 'Municipal/Gov'
    },
    indicatorsOfCompromise: ['AKIAIOSFODNN7EXAMPLE', 'pastebin.com/raw/k9Xw2M4p'],
    verified: true
  }
];

export const INITIAL_ALERT_RULES: AlertRule[] = [
  {
    id: 'rule-critical-southeast',
    name: 'GA & FL Critical Infrastructure Alert',
    enabled: true,
    channels: ['discord', 'slack', 'email'],
    minThreatLevel: 'CRITICAL',
    stateFilter: 'All',
    panicSentimentOnly: false,
    keywords: ['scada', 'ransomware', 'volt typhoon', 'lockbit', 'zero-day'],
    webhookUrlDiscord: 'https://discord.com/api/webhooks/mock-argus-soc-channel/ga-fl-threats',
    webhookUrlSlack: 'https://hooks.slack.com/services/T00000000/B00000000/mockargusalerts',
    alertEmail: 'jordan.gloria61@yahoo.com'
  },
  {
    id: 'rule-darkweb-dumps',
    name: 'Dark Web Breach & Credential Leaks',
    enabled: true,
    channels: ['discord', 'email'],
    minThreatLevel: 'HIGH',
    stateFilter: 'All',
    panicSentimentOnly: true,
    keywords: ['leak dump', 'onion', 'extortion', 'breached'],
    webhookUrlDiscord: 'https://discord.com/api/webhooks/mock-argus-soc-channel/darkweb-dumps',
    alertEmail: 'jordan.gloria61@yahoo.com'
  }
];

export const DEMO_PHONE_ADMINS: PhoneAuthUser[] = [
  {
    phoneNumber: '+1 (404) 555-0199',
    role: 'ADMIN',
    adminLevel: 'SOC_COMMANDER',
    authenticated: true,
    agency: 'Georgia Cyber Center (Fort Eisenhower Command)',
    location: 'Atlanta / Augusta, GA'
  },
  {
    phoneNumber: '+1 (305) 555-0188',
    role: 'ADMIN',
    adminLevel: 'SOC_COMMANDER',
    authenticated: true,
    agency: 'Florida Cyber Threat Response Command',
    location: 'Miami / Tallahassee, FL'
  },
  {
    phoneNumber: '+1 (706) 555-0144',
    role: 'CYBER_ANALYST',
    adminLevel: 'CYBER_ANALYST',
    authenticated: true,
    agency: 'Southeast Regional Critical Infrastructure Taskforce',
    location: 'Savannah / Jacksonville Regional SOC'
  }
];
