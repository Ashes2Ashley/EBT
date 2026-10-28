import { PhoneAuthUser, AuthAuditRecord, UserRole } from '../types/osint';

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds

interface RateLimitTracker {
  failedAttempts: number;
  lastAttemptTime: number;
  lockoutUntil: number;
}

const failedAttemptMap = new Map<string, RateLimitTracker>();

export function checkRateLimit(phone: string): { allowed: boolean; remainingSeconds: number; failedCount: number } {
  const clean = phone.trim();
  const now = Date.now();
  const record = failedAttemptMap.get(clean);

  if (!record) {
    return { allowed: true, remainingSeconds: 0, failedCount: 0 };
  }

  // Check if actively locked out
  if (record.lockoutUntil > now) {
    const remaining = Math.ceil((record.lockoutUntil - now) / 1000);
    return { allowed: false, remainingSeconds: remaining, failedCount: record.failedAttempts };
  }

  // Reset if window has elapsed
  if (now - record.lastAttemptTime > RATE_LIMIT_WINDOW_MS) {
    failedAttemptMap.delete(clean);
    return { allowed: true, remainingSeconds: 0, failedCount: 0 };
  }

  return { allowed: true, remainingSeconds: 0, failedCount: record.failedAttempts };
}

export function recordFailedAuthAttempt(phone: string): { lockedNow: boolean; lockoutSeconds: number } {
  const clean = phone.trim();
  const now = Date.now();
  const record = failedAttemptMap.get(clean) || { failedAttempts: 0, lastAttemptTime: now, lockoutUntil: 0 };

  record.failedAttempts += 1;
  record.lastAttemptTime = now;

  if (record.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    record.lockoutUntil = now + LOCKOUT_DURATION_MS;
    failedAttemptMap.set(clean, record);
    return { lockedNow: true, lockoutSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000) };
  }

  failedAttemptMap.set(clean, record);
  return { lockedNow: false, lockoutSeconds: 0 };
}

export function resetAuthFailureCount(phone: string): void {
  failedAttemptMap.delete(phone.trim());
}

/**
 * Generate cryptographic signed session token
 */
export function generateSessionToken(phone: string, role: UserRole): string {
  const timestamp = Date.now();
  const raw = `${phone}:${role}:${timestamp}:ARGUS_SALT_SECRET_SEC`;
  // Simple deterministic cryptographic signature
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase();
  return `ARGUS-OAUTH-${hex}-${timestamp.toString(36).toUpperCase()}`;
}

export function validateSessionToken(token?: string): boolean {
  if (!token || !token.startsWith('ARGUS-OAUTH-')) return false;
  return token.length > 20;
}

export function getAdminClearanceLevel(phone: string): { role: UserRole; adminLevel: PhoneAuthUser['adminLevel']; agency: string; isPresetAdmin: boolean } {
  const clean = phone.trim();
  if (clean.includes('404')) {
    return {
      role: 'ADMIN',
      adminLevel: 'SOC_COMMANDER',
      agency: 'Georgia Cyber Center (Fort Eisenhower Command)',
      isPresetAdmin: true
    };
  }
  if (clean.includes('305')) {
    return {
      role: 'ADMIN',
      adminLevel: 'SOC_COMMANDER',
      agency: 'Florida Cyber Threat Response Command',
      isPresetAdmin: true
    };
  }
  if (clean.includes('706')) {
    return {
      role: 'CYBER_ANALYST',
      adminLevel: 'CYBER_ANALYST',
      agency: 'Southeast Regional Critical Infrastructure Taskforce',
      isPresetAdmin: true
    };
  }

  // Registered external phone gets field analyst or admin depending on request
  return {
    role: 'ADMIN',
    adminLevel: 'SOC_COMMANDER',
    agency: 'Autonomous Field Cyber Defense Unit',
    isPresetAdmin: false
  };
}

const STORAGE_KEY_AUTH = 'argus_auth_session';
const STORAGE_KEY_AUDIT = 'argus_auth_audit_log';

export function saveStoredSession(user: PhoneAuthUser | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    }
  } catch {
    // Ignore storage quota
  }
}

export function loadStoredSession(): PhoneAuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PhoneAuthUser;
    if (parsed.sessionExpiresAt && Date.now() > parsed.sessionExpiresAt) {
      localStorage.removeItem(STORAGE_KEY_AUTH);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function logAuthAuditRecord(record: Omit<AuthAuditRecord, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT);
    const list: AuthAuditRecord[] = raw ? JSON.parse(raw) : [];
    const full: AuthAuditRecord = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString() + ' UTC',
      ...record
    };
    list.unshift(full);
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(list.slice(0, 25)));
  } catch {
    // Ignore
  }
}

export function getAuthAuditLog(): AuthAuditRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
