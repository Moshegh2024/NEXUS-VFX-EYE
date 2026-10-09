import test from 'node:test';
import assert from 'node:assert/strict';
import { Runtime, RuntimeError } from '../app/src/runtime.js';

function toMission() {
  const r = new Runtime();
  r.dispatch('BOOT_COMPLETE');
  r.dispatch('OPEN_DAY', { day_id: 'DAY-001', mission_id: 'MISSION-DAY-001' });
  r.dispatch('START_STAGE_MINUS_1');
  r.dispatch('OPEN_STAGE_0');
  r.dispatch('GRANT_STAGE_0_CONSENT');
  r.dispatch('START_MISSION');
  return r;
}

test('mission cannot skip Stage -1 or consent gate', () => {
  const r = new Runtime();
  r.dispatch('BOOT_COMPLETE');
  r.dispatch('OPEN_DAY', { day_id: 'DAY-001', mission_id: 'MISSION-DAY-001' });
  assert.throws(() => r.dispatch('OPEN_STAGE_0'), RuntimeError);
  r.dispatch('START_STAGE_MINUS_1');
  r.dispatch('OPEN_STAGE_0');
  r.dispatch('DENY_STAGE_0_CONSENT');
  assert.equal(r.s.state, 'DAY_OVERVIEW');
});

test('mission submit requires observations, evidence, two hypotheses and causal diagnosis', () => {
  const r = toMission();
  assert.throws(() => r.dispatch('SUBMIT_ATTEMPT'), /submission incomplete/);
  r.dispatch('SET_OBSERVATION', { value: ['edge fringe at frame 12'] });
  r.dispatch('ADD_EVIDENCE', { value: 'frame 12 / left contour' });
  r.dispatch('ADD_HYPOTHESIS', { value: 'premultiplication mismatch' });
  r.dispatch('ADD_HYPOTHESIS', { value: 'edge defocus mismatch' });
  r.dispatch('SET_DIAGNOSIS', { value: 'edge integration mismatch' });
  r.dispatch('SET_CAUSAL_CHAIN', { value: 'wrong alpha interpretation → fringe' });
  r.dispatch('SET_CORRECTION_ORDER', { value: 'alpha interpretation → edge treatment' });
  r.dispatch('SET_CONFIDENCE', { value: 72 });
  r.dispatch('SUBMIT_ATTEMPT');
  assert.equal(r.s.state, 'EXAMINER_REVIEW');
});

test('client cannot mutate canonical ground truth or mastery', () => {
  const r = new Runtime();
  assert.throws(() => r.dispatch('WRITE_GROUND_TRUTH'), /forbidden client action/);
  assert.throws(() => r.dispatch('WRITE_MASTERY'), /forbidden client action/);
  assert.throws(() => r.dispatch('MUTATE_CANONICAL'), /forbidden client action/);
});

test('confidence must stay within 0..100', () => {
  const r = toMission();
  r.dispatch('SET_OBSERVATION', { value: ['observation'] });
  r.dispatch('ADD_EVIDENCE', { value: 'frame 1' });
  r.dispatch('ADD_HYPOTHESIS', { value: 'hypothesis A' });
  r.dispatch('ADD_HYPOTHESIS', { value: 'hypothesis B' });
  r.dispatch('SET_DIAGNOSIS', { value: 'diagnosis' });
  r.dispatch('SET_CAUSAL_CHAIN', { value: 'cause → effect' });
  r.dispatch('SET_CORRECTION_ORDER', { value: 'upstream → downstream' });
  r.dispatch('SET_CONFIDENCE', { value: 101 });
  assert.throws(() => r.dispatch('SUBMIT_ATTEMPT'), /confidence must be 0..100/);
});