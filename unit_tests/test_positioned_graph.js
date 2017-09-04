QUnit.module('positioned_graph.js');
/* globals QUnit TAU toDirection toOffsetPoint toOffsetPath toTurningPath Placement Track*/
/* eslint-disable no-magic-numbers, no-underscore-dangle */

function rounded(number) {
  return Math.round(number * 1000000) / 1000000;
}

function snapped(track) {
  for (const placement of track.placements) {
    const [x, y] = placement.position;
    placement.position = [rounded(x), rounded(y)];
    placement.theta = rounded(placement.theta);
    placement.progress = rounded(placement.progress);
  }
  return track;
}

QUnit.test('compute negative direction in default range', (assert) => {
  assert.deepEqual(toDirection([-3, -4]), Math.atan2(-4, -3));
});

QUnit.test('compute positive direction in default range', (assert) => {
  assert.deepEqual(toDirection([3, 4]), Math.atan2(4, 3));
});

QUnit.test('compute positive direction in shifted ranges', (assert) => {
  assert.deepEqual(rounded(toDirection([3, 4], -TAU / 4)), rounded(Math.atan2(4, 3)));
  assert.deepEqual(rounded(toDirection([3, 4], TAU / 2)), rounded(Math.atan2(4, 3)));
  assert.deepEqual(toDirection([3, 4], 3 * TAU / 4), TAU + Math.atan2(4, 3));
  assert.deepEqual(toDirection([3, 4], -TAU / 2), -TAU + Math.atan2(4, 3));
});

QUnit.test('compute point offset from straight angle', (assert) => {
  assert.deepEqual(toOffsetPoint([2, 1], [2, 2], [2, 3], 1), [1, 2]);
});

QUnit.test('compute point offset from right angle', (assert) => {
  assert.deepEqual(toOffsetPoint([2, 1], [2, 2], [1, 2], 1), [1, 1]);
});

QUnit.test('compute path offset from straight angle', (assert) => {
  assert.deepEqual(toOffsetPath([[2, 1], [2, 2], [2, 3]], 1), [[1, 1], [1, 2], [1, 3]]);
});

QUnit.test('compute path offset from right angle', (assert) => {
  assert.deepEqual(toOffsetPath([[2, 1], [2, 2], [1, 2]], 1), [[1, 1], [1, 1], [1, 1]]);
});

QUnit.test('compute loose turning path from leftward vee', (assert) => {
  const offsetPath = [[2, 1], [1, 0], [0, 1]];
  const turningPath = toTurningPath(offsetPath, 1);
  assert.deepEqual(turningPath, [
    new Placement([2, 1], Math.atan2(-1, -1)),
    new Placement([1.5, 0.5], Math.atan2(-1, -1)),
    new Placement([1, 0], -TAU + Math.atan2(0, -1)),
    new Placement([0.5, 0.5], -TAU + Math.atan2(1, -1)),
    new Placement([0, 1], -TAU + Math.atan2(1, -1)),
  ]);
});

QUnit.test('compute tight turning path from leftward vee', (assert) => {
  const offsetPath = [[2, 1], [1, 0], [0, 1]];
  const turningPath = toTurningPath(offsetPath, Math.sqrt(2) / 4);
  assert.deepEqual(turningPath, [
    new Placement([2, 1], Math.atan2(-1, -1)),
    new Placement([1.25, 0.25], Math.atan2(-1, -1)),
    new Placement([1, 0], -TAU + Math.atan2(0, -1)),
    new Placement([0.75, 0.25], -TAU + Math.atan2(1, -1)),
    new Placement([0, 1], -TAU + Math.atan2(1, -1)),
  ]);
});

QUnit.test('compute full track from leftward vee', (assert) => {
  const track = snapped(new Track([[2, 1], [1, 0], [0, 1]], Math.sqrt(2), Math.sqrt(2)));
  assert.deepEqual(track.getPlacements(), [
    new Placement([3, 0], rounded(Math.atan2(-1, -1)), 0.0),
    new Placement([2, -1], rounded(Math.atan2(-1, -1)), 0.25),
    new Placement([1, -2], rounded(-TAU + Math.atan2(0, -1)), 0.5),
    new Placement([0, -1], rounded(-TAU + Math.atan2(1, -1)), 0.75),
    new Placement([-1, 0], rounded(-TAU + Math.atan2(1, -1)), 1.0),
  ]);
  assert.deepEqual(track !== undefined, true);
});

QUnit.test('compute partial track from leftward vee', (assert) => {
  const track = snapped(new Track([[2, 1], [1, 0], [0, 1]], Math.sqrt(2), Math.sqrt(2)));
  assert.deepEqual(track.getPlacements(1 / 8), [
    new Placement([2.5, -0.5], rounded(Math.atan2(-1, -1)), 0.125),
    new Placement([2, -1], rounded(Math.atan2(-1, -1)), 0.25),
    new Placement([1, -2], rounded(-TAU + Math.atan2(0, -1)), 0.5),
    new Placement([0, -1], rounded(-TAU + Math.atan2(1, -1)), 0.75),
    new Placement([-1, 0], rounded(-TAU + Math.atan2(1, -1)), 1.0),
  ]);
  assert.deepEqual(track !== undefined, true);
});
