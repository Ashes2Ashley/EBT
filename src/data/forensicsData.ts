import { 
  PacketRecord, 
  CryptoWalletTracing, 
  CountyThreatMetric, 
  IncidentTicket 
} from '../types/osint';

export const SAMPLE_PACKETS: PacketRecord[] = [
  {
    id: 'pkt-01',
    timestamp: '12:28:44.102',
    srcIp: '198.51.100.24',
    srcPort: 54122,
    dstIp: '199.111.226.1',
    dstPort: 502,
    protocol: 'TCP',
    flags: 'PSH, ACK',
    lengthBytes: 256,
    payloadAscii: 'MODBUS/TCP: Function 0x05 (Write Single Coil) -> Relay 0x04 Force ON // OVERFLOW_BUFFER_JMP_ESP',
    payloadHex: '00 01 00 00 00 06 01 05 00 04 ff 00 41 41 41 41 41 41 41 41 90 90 90 90 cc cc cc cc',
    isMalicious: true,
    ruleTriggered: 'SIGMA: MODBUS_SCADA_BUFFER_OVERFLOW_ATTEMPT'
  },
  {
    id: 'pkt-02',
    timestamp: '12:28:43.884',
    srcIp: '185.220.101.5',
    srcPort: 49182,
    dstIp: '131.247.1.10',
    dstPort: 443,
    protocol: 'TLS',
    flags: 'ACK',
    lengthBytes: 1024,
    payloadAscii: 'Client Hello [TLS 1.3] Cipher: TLS_AES_256_GCM_SHA384 | JA3 Fingerprint: 72a589da586844d7f0818ce684948eea',
    payloadHex: '16 03 01 02 00 01 00 01 fc 03 03 7f 83 b1 65 7f f1 5d 41 33 22 11 00 aa bb cc dd ee ff',
    isMalicious: true,
    ruleTriggered: 'YARA: TOR_EXIT_NODE_HTTPS_BRUTE_FORCE'
  },
  {
    id: 'pkt-03',
    timestamp: '12:28:42.510',
    srcIp: '167.99.145.82',
    srcPort: 39120,
    dstIp: '199.111.226.1',
    dstPort: 3389,
    protocol: 'TCP',
    flags: 'SYN',
    lengthBytes: 64,
    payloadAscii: 'RDP Negotiation Request: Protocol 0x00000001 (RDP_NEG_RSP) [CredSSP Bypass Probe]',
    payloadHex: '03 00 00 13 0e e0 00 00 00 00 00 01 00 08 00 01 00 00 00',
    isMalicious: true,
    ruleTriggered: 'SURICATA: ET EXPLOIT BlueKeep CVE-2019-0708 Recon'
  },
  {
    id: 'pkt-04',
    timestamp: '12:28:41.200',
    srcIp: '199.111.226.1',
    srcPort: 53,
    dstIp: '8.8.8.8',
    dstPort: 53,
    protocol: 'UDP',
    flags: 'QRY',
    lengthBytes: 78,
    payloadAscii: 'Standard query 0x1a2b A vpn.sav-freight.net [DNS Authority Sync]',
    payloadHex: '1a 2b 01 00 00 01 00 00 00 00 00 00 03 76 70 6e 0b 73 61 76 2d 66 72 65 69 67 68 74 03 6e 65 74',
    isMalicious: false
  }
];

export const GEORGIA_FLORIDA_COUNTIES: CountyThreatMetric[] = [
  // Georgia Counties
  { countyName: 'Fulton County (Atlanta)', state: 'Georgia', threatIndex: 94, criticalAssetCount: 8, activeAttacks: 5, status: 'CRITICAL' },
  { countyName: 'Chatham County (Savannah)', state: 'Georgia', threatIndex: 96, criticalAssetCount: 6, activeAttacks: 4, status: 'CRITICAL' },
  { countyName: 'Richmond County (Augusta / Fort Eisenhower)', state: 'Georgia', threatIndex: 88, criticalAssetCount: 5, activeAttacks: 2, status: 'ELEVATED' },
  { countyName: 'Burke County (Plant Vogtle Nuclear)', state: 'Georgia', threatIndex: 92, criticalAssetCount: 3, activeAttacks: 2, status: 'CRITICAL' },
  { countyName: 'Camden County (Kings Bay Sub Base)', state: 'Georgia', threatIndex: 65, criticalAssetCount: 2, activeAttacks: 0, status: 'NORMAL' },
  { countyName: 'Glynn County (Port of Brunswick)', state: 'Georgia', threatIndex: 78, criticalAssetCount: 3, activeAttacks: 1, status: 'ELEVATED' },
  { countyName: 'Muscogee County (Columbus / Fort Moore)', state: 'Georgia', threatIndex: 70, criticalAssetCount: 4, activeAttacks: 1, status: 'ELEVATED' },

  // Florida Counties
  { countyName: 'Miami-Dade County (PortMiami / FPL)', state: 'Florida', threatIndex: 98, criticalAssetCount: 9, activeAttacks: 6, status: 'CRITICAL' },
  { countyName: 'Hillsborough County (Tampa / MacDill AFB)', state: 'Florida', threatIndex: 91, criticalAssetCount: 7, activeAttacks: 4, status: 'CRITICAL' },
  { countyName: 'Orange County (Orlando Aviation Hub)', state: 'Florida', threatIndex: 85, criticalAssetCount: 6, activeAttacks: 2, status: 'ELEVATED' },
  { countyName: 'Duval County (Jacksonville / Mayport)', state: 'Florida', threatIndex: 84, criticalAssetCount: 5, activeAttacks: 2, status: 'ELEVATED' },
  { countyName: 'Brevard County (Cape Canaveral Space Force)', state: 'Florida', threatIndex: 89, criticalAssetCount: 4, activeAttacks: 2, status: 'ELEVATED' },
  { countyName: 'Leon County (Tallahassee DEM State Gov)', state: 'Florida', threatIndex: 82, criticalAssetCount: 5, activeAttacks: 1, status: 'ELEVATED' },
  { countyName: 'Escambia County (Pensacola Naval Station)', state: 'Florida', threatIndex: 68, criticalAssetCount: 3, activeAttacks: 1, status: 'NORMAL' }
];

export const CRYPTO_WALLETS: CryptoWalletTracing[] = [
  {
    address: 'bc1qa5wkgaew2dkv56kfvj49j0av5nqv05x0gah0df',
    currency: 'BTC',
    balance: '48.19 BTC (~$3,240,000 USD)',
    riskScore: 98,
    clusterLabel: 'LockBit 3.0 Primary Ransom Extortion Cluster',
    ransomwareTaint: 'South Florida Healthcare & Maritime Logistics Ransoms',
    transactionCount: 142,
    isSanctionedOfac: true,
    recentHops: [
      { txHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', amount: '12.5 BTC', timestamp: '1 hour ago', destination: 'Wasabi CoinJoin Mixer Node', hopType: 'MIXER' },
      { txHash: 'ca978112ca1bbdcaf06427e5ac377215a7646b68d4d42909496181b80c102a90', amount: '22.0 BTC', timestamp: '4 hours ago', destination: 'Garantex Exchange Bulletproof Deposit', hopType: 'EXCHANGE' },
      { txHash: '2c5a0e0cdfd997cc0f2694b830d5ef85dc194e44383aa632c0d8cb3ad79de1d4', amount: '13.69 BTC', timestamp: '7 hours ago', destination: 'Cold Storage Vault #94', hopType: 'WALLET' }
    ]
  },
  {
    address: '44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A',
    currency: 'XMR',
    balance: '1,840 XMR (~$302,000 USD)',
    riskScore: 94,
    clusterLabel: 'Exploit.in Escrow Wallet (SCADA 0-Day Auction)',
    ransomwareTaint: 'Pre-auth RCE SCADA Georgia Power Exploit Sale',
    transactionCount: 88,
    isSanctionedOfac: false,
    recentHops: [
      { txHash: 'xmr_ring_sig_7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', amount: '45 XMR', timestamp: '24 min ago', destination: 'Stealth RingCT Escrow Hold', hopType: 'MIXER' },
      { txHash: 'xmr_ring_sig_b841a2001e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991', amount: '120 XMR', timestamp: '2 hours ago', destination: 'Private Subaddress Cluster', hopType: 'WALLET' }
    ]
  }
];

export const INITIAL_INCIDENT_TICKETS: IncidentTicket[] = [
  {
    id: 'INC-2026-084',
    title: 'Volt Typhoon Inbound SCADA Modbus Injection on Port of Savannah',
    severity: 'CRITICAL',
    status: 'CONTAINMENT_IN_PROGRESS',
    affectedState: 'Georgia',
    facility: 'Port of Savannah - Garden City Terminal',
    assignedUnit: 'Fort Eisenhower Cyber Quick Reaction Taskforce',
    threatActor: 'Volt Typhoon',
    createdTime: '18 minutes ago',
    cve: 'CVE-2024-3400 (Palo Alto GlobalProtect)',
    notes: [
      '[12:10 UTC] Telemetry flagged living-off-the-land script certutil.exe staging payload on edge router.',
      '[12:15 UTC] Emergency null-route applied to source IP 198.51.100.24.',
      '[12:22 UTC] Terminal switches isolated to air-gap failover mode. Maritime vessel manifests secured.'
    ]
  },
  {
    id: 'INC-2026-085',
    title: 'LockBit 3.0 Ransomware Extortion Countdown on South Florida Healthcare',
    severity: 'CRITICAL',
    status: 'TRIAGED',
    affectedState: 'Florida',
    facility: 'South Florida Medical Center Network (Miami)',
    assignedUnit: 'Florida Cyber Threat Response Command (Miami Detachment)',
    threatActor: 'LockBit 3.0',
    createdTime: '42 minutes ago',
    cve: 'CVE-2023-4966 (Citrix Bleed Session Replay)',
    notes: [
      '[11:45 UTC] Tor .onion countdown timer verified at 4 hours remaining.',
      '[11:52 UTC] Forensic extraction confirms 850GB exfiltration via StealBit utility.',
      '[12:04 UTC] Mandated Active Directory Kerberos Golden Ticket revocation across all hospital forests.'
    ]
  },
  {
    id: 'INC-2026-086',
    title: 'Port 502 Substation Reconnaissance Probe on Plant Vogtle Nuclear Grid',
    severity: 'HIGH',
    status: 'OPEN',
    affectedState: 'Georgia',
    facility: 'Plant Vogtle Nuclear Generating Station (Waynesboro)',
    assignedUnit: 'Georgia Power Grid Defense Operations',
    threatActor: 'APT28',
    createdTime: '1 hour ago',
    cve: 'CVE-2023-38545 (SOCKS5 Buffer Overflow Probe)',
    notes: [
      '[11:20 UTC] Modbus port 502 connection attempts detected from European Tor exit nodes.',
      '[11:35 UTC] Perimeter scrub rule deployed. Zero internal control systems impacted.'
    ]
  }
];

export const YARA_SIGMA_TEMPLATES = {
  yaraVoltTyphoon: `rule APT_VoltTyphoon_LivingOffTheLand_GA_FL {
    meta:
        description = "Detects Volt Typhoon batch scripts and Living-Off-The-Land execution targeting SE US grid"
        author = "ARGUS Cyber Command SOC"
        date = "2026-10-26"
        reference = "CISA Alert AA24-038A"
        threat_level = "CRITICAL"
        target_regions = "Georgia, Florida"
    strings:
        $s1 = "certutil.exe -urlcache -split -f" ascii wide nocase
        $s2 = "wmic shadowcopy delete /nointeractive" ascii wide nocase
        $s3 = "powershell.exe -nop -w hidden -enc" ascii wide nocase
        $s4 = "fast_reverse_proxy_client" ascii wide
        $s5 = "netsh interface portproxy add v4tov4" ascii wide nocase
    condition:
        3 of ($s*) and filesize < 5MB
}`,

  sigmaLockBit: `title: LockBit 3.0 Ransomware Activity on Southeast Critical Assets
id: e4b2d381-8b29-41e9-8931-7b92dc18148a
status: experimental
description: Detects LockBit 3.0 payload execution, shadow copy deletion, and wallpaper extortion markers
logsource:
    category: process_creation
    product: windows
detection:
    selection_cmd:
        CommandLine|contains:
            - 'vssadmin delete shadows /all /quiet'
            - 'bcdedit /set {default} bootstatuspolicy ignoreallfailures'
            - 'bcdedit /set {default} recoveryenabled no'
            - 'wbadmin delete catalog -quiet'
    selection_ext:
        Image|endswith:
            - 'lockbit3.exe'
            - 'stealbit.exe'
    condition: selection_cmd or selection_ext
fields:
    - CommandLine
    - ParentImage
    - User
level: critical`
};
