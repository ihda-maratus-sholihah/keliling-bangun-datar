import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGeometryModel,
  calculatePerimeter,
  DEFAULT_DIMENSIONS,
  getTriangleSides,
} from './geometry';
import {
  computeGamificationStats,
  computeLevelInfo,
  computeUnlockedBadges,
} from './gamification';
import {
  ASSESSMENT_QUESTIONS,
  getPredicate,
  gradeAssessment,
  KKM_SCORE,
} from './assessment';
import {
  computeRecapSummary,
  createSeedAttempts,
  filterAndSortRecaps,
  formatDuration,
  generateRecapCsv,
} from './recap';
import { createInitialAppState } from './storage';

test('calculatePerimeter computes persegi accurately', () => {
  const res = calculatePerimeter('persegi', { ...DEFAULT_DIMENSIONS, sisi: 7 });
  assert.equal(res.perimeter, 28);
  assert.deepEqual(res.sides, [7, 7, 7, 7]);
  assert.equal(res.formulaSymbolic, 'K = 4 × s');
});

test('calculatePerimeter computes persegi panjang accurately', () => {
  const res = calculatePerimeter('persegi-panjang', {
    ...DEFAULT_DIMENSIONS,
    panjang: 10,
    lebar: 6,
  });
  assert.equal(res.perimeter, 32);
  assert.deepEqual(res.sides, [10, 6, 10, 6]);
});

test('calculatePerimeter computes all triangle kinds accurately and preserves triangle inequality', () => {
  const eq = calculatePerimeter('segitiga', {
    ...DEFAULT_DIMENSIONS,
    triangleKind: 'sama-sisi',
    sisiA: 9,
  });
  assert.equal(eq.perimeter, 27);
  assert.deepEqual(eq.sides, [9, 9, 9]);

  // Triangle inequality enforcement for sama-kaki when sisiB is too short
  const isoSides = getTriangleSides('sama-kaki', 10, 3, 3);
  assert.equal(isoSides[0], 10);
  assert.ok(isoSides[1] + isoSides[2] > isoSides[0]);

  const right = calculatePerimeter('segitiga', {
    ...DEFAULT_DIMENSIONS,
    triangleKind: 'siku-siku',
    sisiA: 12,
    sisiB: 5,
    sisiC: 13,
  });
  assert.equal(right.perimeter, 30);
});

test('buildGeometryModel produces finite SVG coordinates and matching edge count', () => {
  const sq = buildGeometryModel('persegi', { ...DEFAULT_DIMENSIONS, sisi: 6 });
  assert.equal(sq.edges.length, 4);
  assert.equal(sq.points.length, 4);

  const tri = buildGeometryModel('segitiga', {
    ...DEFAULT_DIMENSIONS,
    triangleKind: 'sama-kaki',
    sisiA: 6,
    sisiB: 8,
    sisiC: 8,
  });
  assert.equal(tri.edges.length, 3);
  for (const pt of tri.points) {
    assert.ok(Number.isFinite(pt.x) && Number.isFinite(pt.y));
  }
});

test('gamification unlocks badges and scales levels strictly from real progress', () => {
  const state = createInitialAppState();
  assert.deepEqual(computeUnlockedBadges(state), []);
  assert.equal(computeLevelInfo(0).level, 1);

  state.profile.name = 'Alya Rahma';
  state.learnedShapes = ['segitiga', 'persegi', 'persegi-panjang'];
  state.practice.completedMissionIds = ['misi-1', 'misi-2', 'misi-3'];
  state.practice.answeredIds = {
    'lat-1': { selected: 28, correct: true },
    'lat-2': { selected: 28, correct: true },
    'lat-3': { selected: 24, correct: true },
    'lat-4': { selected: 24, correct: true },
  };

  const stats = computeGamificationStats(state);
  assert.ok(stats.unlockedBadges.includes('langkah-pertama'));
  assert.ok(stats.unlockedBadges.includes('penjelajah-segitiga'));
  assert.ok(stats.unlockedBadges.includes('bintang-latihan'));
  assert.ok(stats.unlockedBadges.includes('arsitek-taman'));
  assert.ok(stats.levelInfo.level >= 3);
  assert.ok(stats.stars >= 20);
});

test('gradeAssessment scores all 10 questions, evaluates KKM 75, and computes per-shape breakdown', () => {
  const perfectAnswers: Record<string, 'A' | 'B' | 'C' | 'D'> = {};
  for (const q of ASSESSMENT_QUESTIONS) {
    perfectAnswers[q.id] = q.correctKey;
  }

  const perfect = gradeAssessment({
    id: 'test-1',
    studentName: 'Budi',
    kelas: 'Kelas 4A',
    answers: perfectAnswers,
    durationSeconds: 180,
  });
  assert.equal(perfect.score, 100);
  assert.equal(perfect.passed, true);
  assert.equal(perfect.predicate, 'Sangat Baik');
  assert.equal(perfect.topicBreakdown.length, 3);
  assert.ok(perfect.topicBreakdown.every((t) => t.percent === 100));

  const failing = gradeAssessment({
    id: 'test-2',
    studentName: 'Cici',
    kelas: 'Kelas 4B',
    answers: { 'as-1': 'B' },
    durationSeconds: 90,
  });
  assert.equal(failing.score, 10);
  assert.equal(failing.passed, false);
  assert.equal(failing.score < KKM_SCORE, true);
  assert.equal(getPredicate(75), 'Baik');
  assert.equal(getPredicate(60), 'Cukup');
  assert.equal(getPredicate(59), 'Perlu Bimbingan');
});

test('recap filtering, sorting, KPI summary, and CSV export include school and teacher identity', () => {
  const seeds = createSeedAttempts();
  const summary = computeRecapSummary(seeds);
  assert.equal(summary.totalAttempts, 3);
  assert.equal(summary.highestScore, 100);

  const onlyPassed = filterAndSortRecaps(seeds, '', 'tuntas', 'nilai-tertinggi');
  assert.equal(onlyPassed.length, 2);
  assert.equal(onlyPassed[0].studentName, 'Nadia Putri Lestari');

  const searchRaka = filterAndSortRecaps(seeds, 'raka', 'semua', 'nama-az');
  assert.equal(searchRaka.length, 1);
  assert.equal(searchRaka[0].studentName, 'Raka Pratama');

  const csv = generateRecapCsv(seeds);
  assert.ok(csv.includes('SD N 2 SELOKATON'));
  assert.ok(csv.includes("Ihda Mar'atus Sholihah"));
  assert.equal(formatDuration(125), '02:05');
});

test('validateAndAddClass normalizes, validates empty/duplicates, and appends custom classes', async () => {
  const { mergeClassOptions, validateAndAddClass } = await import('./classes');
  const emptyRes = validateAndAddClass([], '  ');
  assert.equal(emptyRes.ok, false);

  const dupDefault = validateAndAddClass([], 'kelas 4a');
  assert.equal(dupDefault.ok, false);

  const addedBare = validateAndAddClass([], '4c');
  assert.equal(addedBare.ok, true);
  if (addedBare.ok) {
    assert.equal(addedBare.value, 'Kelas 4C');
    const merged = mergeClassOptions(addedBare.updatedCustom);
    assert.ok(merged.includes('Kelas 4C'));

    const dupCustom = validateAndAddClass(addedBare.updatedCustom, 'Kelas 4C');
    assert.equal(dupCustom.ok, false);
  }
});

test('speedGame generates 10 valid rounds with 3 unique choices and unlocks Pembalap Keliling badge', async () => {
  const { calculateSpeedPoints, generateSpeedDeck, SPEED_GAME_TOTAL_ROUNDS } = await import(
    './speedGame'
  );
  const deck = generateSpeedDeck(2);
  assert.equal(deck.length, SPEED_GAME_TOTAL_ROUNDS);
  for (const q of deck) {
    assert.equal(q.options.length, 3);
    assert.equal(new Set(q.options).size, 3);
    assert.ok(q.options.includes(q.correctValue));
  }

  assert.equal(calculateSpeedPoints(1), 10);
  assert.equal(calculateSpeedPoints(3), 20);
  assert.equal(calculateSpeedPoints(10), 30);

  const state = createInitialAppState();
  state.practice.speedBestScore = 65;
  const badges = computeUnlockedBadges(state);
  assert.ok(badges.includes('pembalap-keliling'));
});

test('characterGame levels have valid perimeters, movement clamps safely, checkpoints detect hits, and badge unlocks', async () => {
  const {
    ADVENTURE_LEVELS,
    ARENA_WIDTH,
    CHARACTERS,
    findHitCheckpoints,
    stepPlayerPosition,
  } = await import('./characterGame');

  assert.equal(CHARACTERS.length, 3);
  assert.equal(ADVENTURE_LEVELS.length, 5);
  for (const lvl of ADVENTURE_LEVELS) {
    const sumSides = lvl.sides.reduce((a, b) => a + b, 0);
    assert.equal(lvl.perimeter, sumSides);
    assert.equal(lvl.checkpoints.length, lvl.sides.length);
    assert.ok(lvl.gateOptions.includes(lvl.perimeter));
    assert.equal(new Set(lvl.gateOptions).size, 3);
  }

  // Movement stays clamped within arena
  const clamped = stepPlayerPosition({ x: ARENA_WIDTH - 10, y: 100 }, 1, 0, 500, 0.05);
  assert.ok(clamped.x <= ARENA_WIDTH - 26);

  // Checkpoint hit detection works
  const lvl1 = ADVENTURE_LEVELS[0];
  const cp0 = lvl1.checkpoints[0];
  const hits = findHitCheckpoints({ x: cp0.x + 5, y: cp0.y }, lvl1.checkpoints, new Set(), 30);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].id, cp0.id);

  // Badge unlock check
  const state = createInitialAppState();
  state.practice.adventureBestLevel = 2;
  assert.ok(computeUnlockedBadges(state).includes('sahabat-petualang'));
});

test('detectiveGame cases have exact reverse-perimeter math, unique choices, and unlock Detektif Geometri badge', async () => {
  const { DETECTIVE_CASES, evaluateDetectiveGuess, verifyDetectiveCaseMath } = await import(
    './detectiveGame'
  );

  assert.equal(DETECTIVE_CASES.length, 6);
  for (const c of DETECTIVE_CASES) {
    assert.equal(verifyDetectiveCaseMath(c), true, `Case ${c.id} math mismatch`);
    assert.equal(c.options.length, 4);
    assert.equal(new Set(c.options).size, 4);
    assert.ok(c.options.includes(c.missingValue));
    assert.equal(evaluateDetectiveGuess(c, c.missingValue).correct, true);
    assert.equal(evaluateDetectiveGuess(c, c.missingValue + 99).correct, false);
  }

  const state = createInitialAppState();
  state.practice.solvedDetectiveIds = ['det-1', 'det-2', 'det-3', 'det-4'];
  assert.ok(computeUnlockedBadges(state).includes('detektif-geometri'));
});

test('memoryGame builds valid paired decks, matches shape-perimeter pairs accurately, and unlocks Master Memori badge', async () => {
  const { buildMemoryDeck, computeMemoryStars, isMatchingPair } = await import('./memoryGame');

  const superEasyDeck = buildMemoryDeck('super-mudah', 7);
  assert.equal(superEasyDeck.length, 4);
  const easyDeck = buildMemoryDeck('mudah', 7);
  assert.equal(easyDeck.length, 8);
  const fullDeck = buildMemoryDeck('seru', 7);
  assert.equal(fullDeck.length, 12);

  // Every pairId has exactly 1 shape card and 1 perimeter card
  const byPair = new Map<string, typeof fullDeck>();
  for (const card of fullDeck) {
    const arr = byPair.get(card.pairId) ?? [];
    arr.push(card);
    byPair.set(card.pairId, arr);
  }
  assert.equal(byPair.size, 6);
  for (const [, pairCards] of byPair) {
    assert.equal(pairCards.length, 2);
    assert.equal(isMatchingPair(pairCards[0], pairCards[1]), true);
    assert.equal(isMatchingPair(pairCards[0], pairCards[0]), false);
  }

  assert.equal(computeMemoryStars(3, 2), 3);
  assert.equal(computeMemoryStars(5, 2), 2);
  assert.equal(computeMemoryStars(7, 2), 1);
  assert.equal(computeMemoryStars(7, 6), 3);
  assert.equal(computeMemoryStars(11, 6), 2);
  assert.equal(computeMemoryStars(16, 6), 1);

  const state = createInitialAppState();
  state.practice.memoryGamesWon = 1;
  assert.ok(computeUnlockedBadges(state).includes('master-memori'));
});

