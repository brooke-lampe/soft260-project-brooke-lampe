QUnit.module('utility.js');
/* globals QUnit */
/* eslint-disable no-magic-numbers */

QUnit.test('access array element at top', (assert) => {
  const array = [18, -27, -32, 19, 35, -7];
  assert.deepEqual(array.top(), -7);
  assert.deepEqual(array, [18, -27, -32, 19, 35, -7]);
});

QUnit.test('access array elements by index from the top', (assert) => {
  const array = [18, -27, -32, 19, 35, -7];
  assert.deepEqual(array.top(0), -7);
  assert.deepEqual(array.top(1), 35);
  assert.deepEqual(array.top(2), 19);
  assert.deepEqual(array.top(3), -32);
  assert.deepEqual(array.top(4), -27);
  assert.deepEqual(array.top(5), 18);
  assert.deepEqual(array, [18, -27, -32, 19, 35, -7]);
});

QUnit.test('access nonexistent array elements by index from the top', (assert) => {
  const array = [18, -27, -32, 19, 35, -7];
  assert.deepEqual(array.top(-1), undefined);
  assert.deepEqual(array.top(6), undefined);
  assert.deepEqual(array, [18, -27, -32, 19, 35, -7]);
});

QUnit.test('reverse empty array', (assert) => {
  const array = [];
  assert.deepEqual(array.reverse(), []);
  assert.deepEqual(array, []);
});

QUnit.test('reverse nonempty array', (assert) => {
  const array = [18, -27, -32, 19, 35, -7];
  assert.deepEqual(array.reverse(), [-7, 35, 19, -32, -27, 18]);
  assert.deepEqual(array, [18, -27, -32, 19, 35, -7]);
});

QUnit.test('find minimum array element of empty array', (assert) => {
  const array = [];
  assert.deepEqual(array.indexOfMinimum(), undefined);
  assert.deepEqual(array, []);
});

QUnit.test('find minimum array element using natural order', (assert) => {
  const array = [18, -27, -32, 19, 35, -7];
  assert.deepEqual(array.indexOfMinimum(), 2);
  assert.deepEqual(array, [18, -27, -32, 19, 35, -7]);
});

QUnit.test('find minimum array element using reversed order', (assert) => {
  const array = [18, -27, -32, 19, 35, -7];
  assert.deepEqual(array.indexOfMinimum((value) => -value), 4);
  assert.deepEqual(array, [18, -27, -32, 19, 35, -7]);
});

QUnit.test('remove nonexistent array element by negative index', (assert) => {
  const array = [18, -27, -32, 19, 35, -7];
  assert.deepEqual(array.remove(-1), undefined);
  assert.deepEqual(array, [18, -27, -32, 19, 35, -7]);
});

QUnit.test('remove nonexistent array element by positive index', (assert) => {
  const array = [18, -27, -32, 19, 35, -7];
  assert.deepEqual(array.remove(6), undefined);
  assert.deepEqual(array, [18, -27, -32, 19, 35, -7]);
});

QUnit.test('remove array element by index', (assert) => {
  const array = [18, -27, -32, 19, 35, -7];
  assert.deepEqual(array.remove(2), -32);
  assert.deepEqual(array, [18, -27, 19, 35, -7]);
});

QUnit.test('remove nonexistent array element by value', (assert) => {
  const array = [18, -27, -32, 19, 35, -7];
  assert.deepEqual(array.delete(6), [18, -27, -32, 19, 35, -7]);
  assert.deepEqual(array, [18, -27, -32, 19, 35, -7]);
});

QUnit.test('remove array element by value', (assert) => {
  const array = [18, -27, -32, 19, 35, -7];
  assert.deepEqual(array.delete(-32), [18, -27, 19, 35, -7]);
  assert.deepEqual(array, [18, -27, 19, 35, -7]);
});
