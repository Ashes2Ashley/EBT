import { DarkWebForumThread } from '../types/osint';
import { evaluateThreatPrioritization } from '../utils/prioritization';

export const SPECIALIZED_DARKWEB_THREADS: DarkWebForumThread[] = [
  {
    id: 'dw-001',
    forumName: 'Exploit.in',
    threadCategory: '0-DAY_EXPLOIT',
    title: '[0-DAY SALE] Pre-Auth RCE in SCADA Telemetry Gateway used by Southeast US Power Grid',
    authorHandle: 'kernel_reverser_ru',
    authorReputation: 'Verified Exploit Broker (Rep: +284, Escrow: 100%)',
    timestamp: '9 minutes ago',
    price: '45 XMR (~$7,400 USD)',
    currency: 'XMR',
    escrowStatus: 'ESCROW_GUARANTEED',
    threatLevel: 'CRITICAL',
    prioritization: evaluateThreatPrioritization({
      actorName: 'Volt Typhoon',
      sector: 'Energy/Grid',
      content: 'Zero-day pre-auth RCE exploit targeting SCADA Modbus telemetry gateways in Georgia Power and Florida electric substations',
      cve: '0-Day (Unpatched Remote Code Execution)',
      state: 'Georgia',
      city: 'Augusta / Savannah',
      signals: { darkWebAuctionActive: true, liveAttackInProgress: true }
    }),
    targetRegion: 'Georgia',
    targetSector: 'Energy/Grid',
    rawPostText: `Продаю приватный 0-day сплоит для шлюзов телеметрии SCADA DNP3/Modbus. Позволяет выполнить произвольный код с правами root без авторизации. Проверено на оборудовании региональных подстанций штатов Джорджия и Флорида. Полный обход брандмауэра через порт 502/TCP. Сделка строго через Гарант форума в Monero. Покупателю передается готовый Python скрипт + документация по закреплению.`,
    redactedProofSample: `POC_TRIGGER_DEMO:
POST /api/v1/telemetry/packet HTTP/1.1
Host: [REDACTED_GA_GRID_NODE]:502
User-Agent: Mozilla/5.0
Content-Length: 482
\x00\x01\x00\x00\x00\x06\x01\x05\x00\x00\xff\x00[SHELLCODE_OVERFLOW_JUMP_RSP]
# Response: 200 OK (Root Shell Spawns on port 8443)`,
    indicators: ['modbus_rce_payload.py', 'sha256:8b4f12...e81c', '198.51.100.24'],
    attributedActorCandidate: 'Volt Typhoon',
    attributionConfidence: 94,
    relevantToSoutheast: true
  },
  {
    id: 'dw-002',
    forumName: 'BreachForums v3',
    threadCategory: 'INITIAL_ACCESS',
    title: '[AUCTION] Port of Savannah Maritime Container EDI & Active Directory Admin Access',
    authorHandle: 'GhostAccess_IAB',
    authorReputation: 'VIP Initial Access Broker (14 Closed Auctions)',
    timestamp: '22 minutes ago',
    price: '1.2 BTC (~$78,000 USD)',
    currency: 'BTC',
    escrowStatus: 'AUCTION_BIDDING',
    threatLevel: 'CRITICAL',
    prioritization: evaluateThreatPrioritization({
      actorName: 'Scattered Spider',
      sector: 'Maritime/Ports',
      content: 'Initial access broker selling Domain Admin and freight cargo manifest EDI access for Port of Savannah Georgia logistics operator',
      state: 'Georgia',
      city: 'Savannah',
      signals: { darkWebAuctionActive: true, sampleVerified: true }
    }),
    targetRegion: 'Georgia',
    targetSector: 'Maritime/Ports',
    rawPostText: `Selling exclusive high-tier corporate network access for one of the primary logistics & container terminal operators at Garden City Terminal (Port of Savannah, GA).
Network includes:
- Domain Controller Admin credentials (ntds.dit dumped)
- Internal Cargo EDI Manifest system with live vessel tracking
- Palo Alto VPN edge credentials for 42 senior logistics dispatchers
- 84TB of operational freight records.
Minimum bid: 1.2 BTC. Bidding ends in 12 hours. Escrow accepted.`,
    redactedProofSample: `ACTIVE DIRECTORY TREE DUMP SAMPLE:
Domain: SAVANNAH-LOGISTICS.LOCAL
Forest: SAVANNAH-LOGISTICS.LOCAL
Users: 1,842
Domain Admins:
- sav\\svc_dispatcher_admin : [HASH_REDACTED_NTLM_aad3b435b51404eeaad3...]
- sav\\c_henderson : [HASH_REDACTED_NTLM]
Subnets: 10.42.0.0/16, 172.16.80.0/24 (Cisco Catalyst Port Switches)`,
    indicators: ['savannah-logistics.local', 'vpn.sav-freight[.]net', '199.111.226.1'],
    attributedActorCandidate: 'Volt Typhoon',
    attributionConfidence: 91,
    relevantToSoutheast: true
  },
  {
    id: 'dw-003',
    forumName: 'LockBit 3.0 DLS',
    threadCategory: 'RANSOMWARE_AUCTION',
    title: '[EXTORTION PUBLISHED] South Florida Regional Hospital Network: 850GB HIPAA DUMP',
    authorHandle: 'LockBitSupp',
    authorReputation: 'Official Syndicate Representative',
    timestamp: '35 minutes ago',
    price: '$2,500,000 USD Ransom Demanded',
    currency: 'USD',
    escrowStatus: 'DIRECT_SALE',
    threatLevel: 'CRITICAL',
    prioritization: evaluateThreatPrioritization({
      actorName: 'LockBit 3.0',
      sector: 'Healthcare',
      content: 'LockBit 3.0 ransomware extortion countdown timer targeting South Florida hospital network with 850GB of patient medical records and SSNs',
      state: 'Florida',
      city: 'Miami / Fort Lauderdale',
      signals: { liveAttackInProgress: true, darkWebAuctionActive: true, sampleVerified: true }
    }),
    targetRegion: 'Florida',
    targetSector: 'Healthcare',
    rawPostText: `South Florida Regional Healthcare System has failed to reach an agreement within the allocated countdown window. 
All encrypted data including:
- 850,000 Patient Electronic Medical Records (EMR)
- Oncology & cardiology trial data
- Employee payroll, SSNs, and W-2 filings
- Executive board communications and audit ledgers
Download links will be activated in 4 hours unless payment is settled in BTC or XMR.`,
    redactedProofSample: `PATIENT RECORD AUDIT SAMPLE:
PATIENT_ID: FL-MED-994812
NAME: [REDACTED_PII], John M.
DOB: 1974-08-14
SSN: XXX-XX-4819
DIAGNOSIS_CODE: ICD-10-CM I25.10
INSURANCE: Florida Blue / ID: FLB-948102
ADMISSION_FACILITY: Miami Regional Heart Institute`,
    indicators: ['lockbit3_fl_health_decryptor.exe', '185.220.101.5', 'tor://lockbit7x...onion'],
    attributedActorCandidate: 'LockBit 3.0',
    attributionConfidence: 96,
    relevantToSoutheast: true
  },
  {
    id: 'dw-004',
    forumName: 'Russian Market',
    threadCategory: 'BOT_STEALER_LOGS',
    title: '[LOG BATCH] 6,200 Stealer Logs: State of Georgia (.ga.gov) & Florida (.myflorida.com)',
    authorHandle: 'RedLine_Dealer_Vip',
    authorReputation: 'Automated Bot Shop (99.8% Positive Rating)',
    timestamp: '48 minutes ago',
    price: '$15 / Log (Instant Download)',
    currency: 'USD',
    escrowStatus: 'DIRECT_SALE',
    threatLevel: 'HIGH',
    prioritization: evaluateThreatPrioritization({
      actorName: 'Scattered Spider',
      sector: 'Municipal/Gov',
      content: 'Stealer logs batch containing authenticated Okta and VPN session cookies for State of Georgia and Florida agency personnel',
      state: 'Florida',
      city: 'Tallahassee / Atlanta',
      signals: { sampleVerified: true }
    }),
    targetRegion: 'Florida',
    targetSector: 'Municipal/Gov',
    rawPostText: `Fresh Lumma & RedLine stealer log collection extracted from infected corporate and civil service workstations in Southeast US.
Contains active session cookies:
- 1,420 logs with authenticated cookies for *.ga.gov (Georgia Department of Natural Resources & Transportation)
- 2,180 logs with authenticated session cookies for *.myflorida.com (Florida Department of Financial Services & Emergency Ops)
- Office 365, Duo Security MFA tokens, VPN client profiles.`,
    redactedProofSample: `BROWSER_COOKIE_EXTRACT_SAMPLE:
Domain: sso.myflorida.com
Cookie Name: SMSESSION
Value: [REDACTED_MFA_COOKIE_STRING_BASED64]
Expires: 2026-11-01
Workstation OS: Windows 11 Enterprise (FL-DEP-WS04)
Antivirus: Windows Defender (Disabled via PowerShell)`,
    indicators: ['redline_stealer_v4.bin', '167.99.145.82', 'sso.myflorida[.]com'],
    attributedActorCandidate: 'Scattered Spider',
    attributionConfidence: 88,
    relevantToSoutheast: true
  },
  {
    id: 'dw-005',
    forumName: 'XSS.is',
    threadCategory: '0-DAY_EXPLOIT',
    title: '[DISCUSSION & PoC] Citrix NetScaler Memory Leaking Token Exploit targeting Transit Hubs',
    authorHandle: 'buffer_ninja',
    authorReputation: 'Senior Resident (Member since 2018)',
    timestamp: '1 hour ago',
    price: 'Public Research / Weaponized Script 15 XMR',
    currency: 'XMR',
    escrowStatus: 'ESCROW_GUARANTEED',
    threatLevel: 'HIGH',
    prioritization: evaluateThreatPrioritization({
      actorName: 'APT28',
      sector: 'Aviation',
      content: 'Citrix NetScaler ADC token hijack exploit weaponized against Atlanta transit authority and Florida airport telemetry gateways',
      cve: 'CVE-2023-4966 (Citrix Bleed)',
      state: 'Georgia',
      city: 'Atlanta',
      signals: { sampleVerified: true }
    }),
    targetRegion: 'Georgia',
    targetSector: 'Aviation',
    rawPostText: `Выкладываю доработанный эксплойт для CVE-2023-4966 (Citrix Bleed). Скрипт в автоматическом режиме парсит дампы памяти через незащищенный endpoint /oauth/idp/.well-known/openid-configuration и вытаскивает валидные сессионные куки без генерации алертов в SIEM. Проверено на внешних шлюзах транспортных операторов Атланты и аэропортов центральной Флориды.`,
    redactedProofSample: `CITRIX_BLEED_REPLAY_SNIPPET:
import requests
target = "https://vpn.[REDACTED_ATLANTA_TRANSIT].org"
res = requests.get(f"{target}/oauth/idp/.well-known/openid-configuration", headers={"Host": "A"*65535})
# Memory leak output captures raw cookie block:
# NSC_AAAC=4a1b0c9f8e7d...; Domain=.transit.org`,
    indicators: ['citrix_bleed_stealer.py', 'CVE-2023-4966'],
    attributedActorCandidate: 'APT28',
    attributionConfidence: 86,
    relevantToSoutheast: true
  },
  {
    id: 'dw-006',
    forumName: 'Genesis Store clone',
    threadCategory: 'BOT_STEALER_LOGS',
    title: '[BOT PROFILE] Active Windows Server 2022 Bot with RDP & Cisco AnyConnect to Orlando Grid',
    authorHandle: 'genesis_bot_bot',
    authorReputation: 'Automated Bot Marketplace (Escrow Auto)',
    timestamp: '2 hours ago',
    price: '$180 USD',
    currency: 'USD',
    escrowStatus: 'DIRECT_SALE',
    threatLevel: 'HIGH',
    prioritization: evaluateThreatPrioritization({
      actorName: 'Volt Typhoon',
      sector: 'Energy/Grid',
      content: 'Infected Windows Server bot profile maintaining live Cisco AnyConnect session to Central Florida electric utility control subnet',
      state: 'Florida',
      city: 'Orlando',
      signals: { c2Active: true }
    }),
    targetRegion: 'Florida',
    targetSector: 'Energy/Grid',
    rawPostText: `Bot ID: #FL-ORL-88241
Installed OS: Windows Server 2022 Standard
IP: 131.247.1.10 (Florida Subnet)
Browser Profiles: Chrome 128 (412 saved credentials)
Installed Enterprise Software: Cisco AnyConnect Secure Mobility Client, Siemens SIMATIC WinCC, Wireshark.
Active connection to internal SCADA substation monitoring dashboard.`,
    redactedProofSample: `BOT_CREDENTIAL_EXPORT:
URL: https://substation-monitor.ouc[.]com:8443
Username: operator_shift3
Password: [STORED_PLAINTEXT_REDACTED_***]
AnyConnect Profile: OUC-SECURE-SCADA-GATEWAY.pcf`,
    indicators: ['genesis_bot_fl_88241', '131.247.1.10'],
    attributedActorCandidate: 'Volt Typhoon',
    attributionConfidence: 92,
    relevantToSoutheast: true
  }
];
