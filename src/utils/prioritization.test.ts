import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateThreatActorReputationScore, 
  calculatePotentialImpactScore, 
  calculateExploitabilityScore, 
  calculateGeoRelevanceScore,
  evaluateThreatPrioritization,
  dynamicallyAdjustThreatPriority
} from './prioritization';

test('calculateThreatActorReputationScore attributes high scores to known tier-1 state actors', () => {
  assert.equal(calculateThreatActorReputationScore('Volt Typhoon'), 98);
  assert.equal(calculateThreatActorReputationScore('APT28'), 95);
  assert.equal(calculateThreatActorReputationScore('LockBit 3.0'), 92);
  assert.equal(calculateThreatActorReputationScore('Unknown Scripting'), 50);
});

test('calculatePotentialImpactScore evaluates Energy/Grid and Nuclear as maximum impact', () => {
  const energyScore = calculatePotentialImpactScore('Energy/Grid', 'SCADA electrical substation blackout risk');
  assert.ok(energyScore >= 98);

  const maritimeScore = calculatePotentialImpactScore('Maritime/Ports', 'Port of Savannah container terminal');
  assert.ok(maritimeScore >= 93);
});

test('calculateExploitabilityScore flags zero-days with maximum exploitability', () => {
  const zeroDayScore = calculateExploitabilityScore('Critical zero-day exploit with weaponized PoC published in wild');
  assert.ok(zeroDayScore >= 98);

  const portScanScore = calculateExploitabilityScore('Routine port scan and reconnaissance');
  assert.ok(portScanScore <= 60);
});

test('calculateGeoRelevanceScore assigns top priority to Georgia and Florida targets', () => {
  assert.equal(calculateGeoRelevanceScore('Georgia', 'Savannah'), 96);
  assert.equal(calculateGeoRelevanceScore('Florida', 'Miami'), 96);
  assert.equal(calculateGeoRelevanceScore('Multi-State', 'Atlanta and Miami grid tie'), 100);
  assert.equal(calculateGeoRelevanceScore('California', 'Los Angeles'), 30);
});

test('evaluateThreatPrioritization calculates P1_IMMINENT_CRITICAL for GA/FL zero-day attacks', () => {
  const result = evaluateThreatPrioritization({
    actorName: 'Volt Typhoon',
    sector: 'Energy/Grid',
    content: 'Zero-day pre-auth RCE exploit targeting Savannah Port and Georgia power distribution SCADA',
    state: 'Georgia',
    city: 'Savannah',
    signals: { liveAttackInProgress: true, c2Active: true }
  });

  assert.equal(result.priorityTier, 'P1_IMMINENT_CRITICAL');
  assert.ok(result.compositeScore >= 90);
  assert.ok(result.priorityReasons.length > 0);
  assert.ok(result.factors.dynamicAdjustmentBonus > 0);
});

test('dynamicallyAdjustThreatPriority scales composite score when new live signals arrive', () => {
  const initial = evaluateThreatPrioritization({
    actorName: 'LockBit 3.0',
    sector: 'Healthcare',
    content: 'Ransomware threat letter received by South Florida medical center',
    state: 'Florida',
    city: 'Miami'
  });

  const initialScore = initial.compositeScore;

  const adjusted = dynamicallyAdjustThreatPriority(
    initial,
    { liveAttackInProgress: true, darkWebAuctionActive: true },
    'Live encryption payload observed executing on domain controller'
  );

  assert.ok(adjusted.compositeScore >= initialScore);
  assert.ok(adjusted.priorityReasons.includes('Live encryption payload observed executing on domain controller'));
});
