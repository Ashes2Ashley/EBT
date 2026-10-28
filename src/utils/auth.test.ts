import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  checkRateLimit, 
  recordFailedAuthAttempt, 
  resetAuthFailureCount, 
  generateSessionToken, 
  validateSessionToken,
  getAdminClearanceLevel 
} from './auth';

test('checkRateLimit allows initial attempts and records failures up to lockout', () => {
  const phone = '+1 (404) 555-9999';
  resetAuthFailureCount(phone);

  const initial = checkRateLimit(phone);
  assert.equal(initial.allowed, true);
  assert.equal(initial.failedCount, 0);

  // Record 1st and 2nd failure
  recordFailedAuthAttempt(phone);
  recordFailedAuthAttempt(phone);
  const mid = checkRateLimit(phone);
  assert.equal(mid.allowed, true);
  assert.equal(mid.failedCount, 2);

  // 3rd failure triggers lockout
  const third = recordFailedAuthAttempt(phone);
  assert.equal(third.lockedNow, true);
  assert.ok(third.lockoutSeconds > 0);

  const lockedState = checkRateLimit(phone);
  assert.equal(lockedState.allowed, false);
  assert.ok(lockedState.remainingSeconds > 0);

  // Clean reset
  resetAuthFailureCount(phone);
  const afterReset = checkRateLimit(phone);
  assert.equal(afterReset.allowed, true);
});

test('generateSessionToken creates valid cryptographic token string', () => {
  const token = generateSessionToken('+1 (404) 555-0199', 'ADMIN');
  assert.ok(token.startsWith('ARGUS-OAUTH-'));
  assert.equal(validateSessionToken(token), true);
  assert.equal(validateSessionToken('invalid_token'), false);
});

test('getAdminClearanceLevel maps GA and FL phone numbers to SOC_COMMANDER ADMIN', () => {
  const ga = getAdminClearanceLevel('+1 (404) 555-0199');
  assert.equal(ga.role, 'ADMIN');
  assert.equal(ga.adminLevel, 'SOC_COMMANDER');
  assert.ok(ga.agency.includes('Georgia Cyber Center'));

  const fl = getAdminClearanceLevel('+1 (305) 555-0188');
  assert.equal(fl.role, 'ADMIN');
  assert.equal(fl.adminLevel, 'SOC_COMMANDER');
  assert.ok(fl.agency.includes('Florida'));

  const analyst = getAdminClearanceLevel('+1 (706) 555-0144');
  assert.equal(analyst.role, 'CYBER_ANALYST');
});
