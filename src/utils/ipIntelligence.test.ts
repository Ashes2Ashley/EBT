import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidIpv4, lookupIpIntelligence } from './ipIntelligence';

test('isValidIpv4 validates standard IPv4 addresses', () => {
  assert.equal(isValidIpv4('192.168.1.1'), true);
  assert.equal(isValidIpv4('8.8.8.8'), true);
  assert.equal(isValidIpv4('198.51.100.24'), true);
  assert.equal(isValidIpv4('999.1.1.1'), false);
  assert.equal(isValidIpv4('abc.def.ghi.jkl'), false);
  assert.equal(isValidIpv4('1.2.3'), false);
  assert.equal(isValidIpv4('1.2.3.4.5'), false);
});

test('lookupIpIntelligence returns predefined intelligence for known Volt Typhoon C2', () => {
  const result = lookupIpIntelligence('198.51.100.24');
  assert.equal(result.ip, '198.51.100.24');
  assert.equal(result.associatedThreatActor, 'Volt Typhoon');
  assert.equal(result.isKnownC2, true);
  assert.ok(result.threatScore > 90);
  assert.ok(result.openPorts.some(p => p.port === 443 && p.risk === 'HIGH'));
});

test('lookupIpIntelligence returns known Tor exit node profile', () => {
  const result = lookupIpIntelligence('185.220.101.5');
  assert.equal(result.isTorExit, true);
  assert.equal(result.country, 'Germany');
  assert.ok(result.blacklists.some(b => b.name === 'Tor Project Directory' && b.listed === true));
});

test('lookupIpIntelligence deterministically computes profile for any valid custom IP', () => {
  const ip1 = '203.0.113.88';
  const res1 = lookupIpIntelligence(ip1);
  assert.equal(res1.ip, ip1);
  assert.ok(typeof res1.threatScore === 'number');
  assert.ok(typeof res1.latitude === 'number');
  assert.ok(typeof res1.longitude === 'number');
  assert.ok(res1.openPorts.length > 0);
  assert.ok(res1.blacklists.length > 0);
});
