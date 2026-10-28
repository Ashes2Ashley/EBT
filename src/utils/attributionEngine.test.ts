import test from 'node:test';
import assert from 'node:assert/strict';
import { performAttributionAnalysis } from './attributionEngine';

test('performAttributionAnalysis accurately attributes Volt Typhoon on SCADA living-off-the-land signals', () => {
  const sample = 'Adversary utilizing certutil.exe living off the land and fast reverse proxy targeting Port of Savannah switch';
  const result = performAttributionAnalysis(sample, 'Georgia Energy/Grid');
  
  assert.equal(result.primaryActor, 'Volt Typhoon');
  assert.ok(result.confidenceScore >= 80);
  assert.ok(result.corroboratingEvidence.some(e => e.category === 'MITRE_TTP'));
  assert.ok(result.mitreTechniquesIdentified.length > 0);
});

test('performAttributionAnalysis attributes LockBit 3.0 on ransomware extortion and onion leak mirror', () => {
  const sample = 'LockBit affiliate posting countdown ransom note and StealBit exfiltrator logs for South Florida hospital';
  const result = performAttributionAnalysis(sample, 'Florida Healthcare');

  assert.equal(result.primaryActor, 'LockBit 3.0');
  assert.ok(result.confidenceScore >= 75);
  assert.ok(result.corroboratingEvidence.some(e => e.category === 'TARGETING'));
});

test('performAttributionAnalysis returns baseline un-attributed hypothesis when no specific signatures match', () => {
  const sample = 'Generic automated vulnerability scan on port 80';
  const result = performAttributionAnalysis(sample);

  assert.ok(result.primaryActor.includes('Unattributed') || result.confidenceScore <= 60);
  assert.ok(result.recommendedDefenses.length > 0);
});
