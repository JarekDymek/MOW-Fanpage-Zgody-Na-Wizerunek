import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluatePerson,evaluateSelection,groupSummary} from '../src/lib/consent.js';
import {MOCK_PEOPLE} from '../src/data/mock.js';

const day='2026-09-18';
test('active Facebook consent passes',()=>{
  assert.equal(evaluatePerson(MOCK_PEOPLE[0],'facebook',day).level,'ok');
});
test('limited consent blocks Facebook',()=>{
  assert.equal(evaluatePerson(MOCK_PEOPLE[2],'facebook',day).level,'blocked');
});
test('revoked consent blocks',()=>{
  assert.equal(evaluatePerson(MOCK_PEOPLE[3],'facebook',day).level,'blocked');
});
test('youth objection overrides parental consent operationally',()=>{
  assert.equal(evaluatePerson(MOCK_PEOPLE[4],'facebook',day).level,'blocked');
});
test('unknown person forces moderator review',()=>{
  const r=evaluateSelection([MOCK_PEOPLE[0]],{channel:'facebook',unknown:true,today:day});
  assert.equal(r.level,'review');
});
test('group summary exposes exceptions',()=>{
  const r=groupSummary(MOCK_PEOPLE,'VI','facebook',day);
  assert.equal(r.level,'blocked');
  assert.ok(r.blocked.length>=1);
});
