import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeThreatSentiment, computeThreatLevelFromSentiment, calculateFleetThreatSummary } from './sentiment';

test('analyzeThreatSentiment identifies PANIC on critical terms', () => {
  const result = analyzeThreatSentiment('Critical zero-day exploit leaked on dark web targeting SCADA systems');
  assert.equal(result.label, 'PANIC');
  assert.ok(result.urgency >= 75);
  assert.ok(result.keywordsFound.includes('zero-day'));
  assert.ok(result.keywordsFound.includes('scada'));
});

test('analyzeThreatSentiment identifies HOSTILE on attack keywords', () => {
  const result = analyzeThreatSentiment('Malware botnet attempting brute force DDoS on public gateway');
  assert.equal(result.label, 'HOSTILE');
  assert.ok(result.urgency >= 55);
  assert.ok(result.keywordsFound.includes('malware'));
  assert.ok(result.keywordsFound.includes('ddos'));
});

test('analyzeThreatSentiment returns NEUTRAL for standard non-threat text', () => {
  const result = analyzeThreatSentiment('Routine system maintenance scheduled for weekend maintenance window');
  assert.equal(result.label, 'NEUTRAL');
  assert.equal(result.keywordsFound.length, 0);
  assert.ok(result.urgency <= 25);
});

test('computeThreatLevelFromSentiment maps urgencies to valid ThreatLevels', () => {
  assert.equal(computeThreatLevelFromSentiment(90), 'CRITICAL');
  assert.equal(computeThreatLevelFromSentiment(70), 'HIGH');
  assert.equal(computeThreatLevelFromSentiment(50), 'ELEVATED');
  assert.equal(computeThreatLevelFromSentiment(30), 'GUARDED');
  assert.equal(computeThreatLevelFromSentiment(10), 'LOW');
});

test('calculateFleetThreatSummary computes averages and metrics correctly', () => {
  const sample = [
    { sentiment: { urgency: 90, label: 'PANIC' as const, score: -0.9, confidence: 90, keywordsFound: [] }, threatLevel: 'CRITICAL' as const },
    { sentiment: { urgency: 60, label: 'HOSTILE' as const, score: -0.6, confidence: 80, keywordsFound: [] }, threatLevel: 'HIGH' as const },
    { sentiment: { urgency: 30, label: 'NEUTRAL' as const, score: 0, confidence: 70, keywordsFound: [] }, threatLevel: 'LOW' as const }
  ];
  const summary = calculateFleetThreatSummary(sample);
  assert.equal(summary.averageUrgency, 60);
  assert.equal(summary.panicCount, 1);
  assert.equal(summary.hostileCount, 1);
  assert.equal(summary.criticalCount, 1);
  assert.equal(summary.overallStatus, 'ELEVATED_RISK');
});
