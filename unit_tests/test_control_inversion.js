QUnit.module('control_inversion.js');
/* globals QUnit runningCoprograms Coprogram block UNPAUSE pause */
/* eslint-disable no-magic-numbers, no-underscore-dangle */

QUnit.test('run a coprogram that does not yield', (assert) => {
  let ran = false;
  const main = new Coprogram(function*main() { // eslint-disable-line require-yield
    ran = true;
  });
  assert.deepEqual(ran, false);
  main.run();
  assert.deepEqual(ran, true);
});

QUnit.test('run a coprogram that yields', (assert) => {
  let began = false;
  let ended = false;
  const main = new Coprogram(function*main() {
    began = true;
    yield;
    ended = true;
  });
  assert.deepEqual(began, false);
  assert.deepEqual(ended, false);
  main.run();
  assert.deepEqual(began, true);
  assert.deepEqual(ended, false);
  main.unblock();
  assert.deepEqual(began, true);
  assert.deepEqual(ended, true);
});

QUnit.test('provide an external input to a coprogram while it is running', (assert) => {
  let result = undefined;
  const main = new Coprogram(function*main() {
    result = yield;
  });
  assert.deepEqual(result, undefined);
  main.run();
  assert.deepEqual(result, undefined);
  main.unblock(42);
  assert.deepEqual(result, 42);
});

QUnit.test('provide an internal input to a coprogram while it is running', (assert) => {
  let result = undefined;
  const main = new Coprogram(function*main() {
    runningCoprograms.top().unblock(42);
    result = yield;
  });
  assert.deepEqual(result, undefined);
  main.run();
  assert.deepEqual(result, 42);
});

QUnit.test('provide an external input to a coprogram before it runs', (assert) => {
  let result = undefined;
  const main = new Coprogram(function*main() {
    result = yield;
  });
  main.unblock(42);
  assert.deepEqual(result, undefined);
  main.run();
  assert.deepEqual(result, 42);
});

QUnit.test('provide multiple inputs to a coprogram from different sources', (assert) => {
  let result = 0;
  const main = new Coprogram(function*main() {
    assert.deepEqual(result, 0);
    result += yield;
    assert.deepEqual(result, 1);
    result += yield;
    assert.deepEqual(result, 3);
    runningCoprograms.top().unblock(3);
    runningCoprograms.top().unblock(4);
    assert.deepEqual(result, 3);
    result += yield;
    assert.deepEqual(result, 6);
    result += yield;
    assert.deepEqual(result, 10);
    result += yield;
    assert.deepEqual(result, 15);
    result += yield;
    assert.deepEqual(result, 21);
  });
  main.unblock(1);
  main.unblock(2);
  main.run();
  main.unblock(5);
  main.unblock(6);
  assert.deepEqual(result, 21);
});

QUnit.test('provide an internal input via a call to block', (assert) => {
  let result = 0;
  const main = new Coprogram(function*main() {
    const addend = yield* block((unblock) => { // Not "result +="; see https://tc39.github.io/ecma262/#sec-assignment-operators-runtime-semantics-evaluation
      assert.deepEqual(result, 0);
      result += 1;
      unblock(2);
    }, () => {
      assert.deepEqual(result, 1);
    });
    result += addend;
    assert.deepEqual(result, 3);
  });
  assert.deepEqual(result, 0);
  main.run();
  assert.deepEqual(result, 3);
});

QUnit.test('provide an external input via a call to block', (assert) => {
  const done = assert.async();
  let result = 0;
  const main = new Coprogram(function*main() {
    const addend = yield* block((unblock) => { // Not "result +="; see https://tc39.github.io/ecma262/#sec-assignment-operators-runtime-semantics-evaluation
      assert.deepEqual(result, 0);
      result += 1;
      window.setTimeout(() => {
        unblock(2);
      }, 0);
    }, () => {
      assert.deepEqual(result, 1);
    });
    result += addend;
    assert.deepEqual(result, 3);
    done();
  });
  assert.deepEqual(result, 0);
  main.run();
  assert.deepEqual(result, 1);
});

QUnit.test('pause a coprogram', (assert) => {
  const done = assert.async();
  const main = new Coprogram(function*main() {
    const timestamp = Date.now();
    const input = yield* pause(100);
    const elapsed = Date.now() - timestamp;
    assert.ok(elapsed >= 100, `call to pause returned after ${elapsed}ms; expected at least 100ms`);
    assert.deepEqual(input, UNPAUSE);
    done();
  });
  main.run();
});
