QUnit.module('throttled_simulation.js');
/* globals QUnit SimulationEvent Simulation ThrottledSimulation */
/* eslint-disable no-magic-numbers */

const TIMER_ERROR_TOLERANCE = 10; // minimum separation in milliseconds that we expect to be enough to preserve timeout order (must be greater than zero)

QUnit.test('step through events at constant speed', (assert) => {
  const simulation = new Simulation();
  const result = [];
  simulation.addEvent(new SimulationEvent(2, () => {
    result.push(2);
  }));
  simulation.addEvent(new SimulationEvent(4, () => {
    result.push(4);
  }));
  simulation.addEvent(new SimulationEvent(3, () => {
    result.push(3);
  }));
  const done = assert.async();
  let actualCounter = 0;
  let expectedCounter = 0;
  const throttled = new ThrottledSimulation(simulation, () => {
    assert.deepEqual(actualCounter, expectedCounter); // if this fails intermittently, TIMER_ERROR_TOLERANCE may need to be set to a higher value
    switch (actualCounter) {
    case 0:
      assert.deepEqual(throttled.currentTime, 0);
      assert.deepEqual(result, []);
      window.setTimeout(() => ++expectedCounter, 100 - TIMER_ERROR_TOLERANCE);
      break;
    case 1:
      assert.deepEqual(throttled.currentTime, 2);
      assert.deepEqual(result, [2]);
      window.setTimeout(() => ++expectedCounter, 50 - TIMER_ERROR_TOLERANCE);
      break;
    case 2:
      assert.deepEqual(throttled.currentTime, 3);
      assert.deepEqual(result, [2, 3]);
      window.setTimeout(() => ++expectedCounter, 50 - TIMER_ERROR_TOLERANCE);
      break;
    case 3:
      assert.deepEqual(throttled.currentTime, 4);
      assert.deepEqual(result, [2, 3, 4]);
      assert.deepEqual(simulation.pendingEvents, []);
      done();
      break;
    default:
      assert.ok(false, `actualCounter was ${actualCounter}, which is not in range`);
      done();
    }
    ++actualCounter;
  });
  throttled.slowness = 50;
});

QUnit.test('step through events at variable speed, changing speed at an event', (assert) => {
  const simulation = new Simulation();
  const result = [];
  simulation.addEvent(new SimulationEvent(2, () => {
    result.push(2);
  }));
  simulation.addEvent(new SimulationEvent(4, () => {
    result.push(4);
  }));
  simulation.addEvent(new SimulationEvent(3, () => {
    result.push(3);
  }));
  const done = assert.async();
  let actualCounter = 0;
  let expectedCounter = 0;
  const throttled = new ThrottledSimulation(simulation, () => {
    assert.deepEqual(actualCounter, expectedCounter); // if this fails intermittently, TIMER_ERROR_TOLERANCE may need to be set to a higher value
    switch (actualCounter) {
    case 0:
      assert.deepEqual(throttled.currentTime, 0);
      assert.deepEqual(result, []);
      window.setTimeout(() => ++expectedCounter, 100 - TIMER_ERROR_TOLERANCE);
      break;
    case 1:
      assert.deepEqual(throttled.currentTime, 2);
      assert.deepEqual(result, [2]);
      ++expectedCounter; // will change speed below
      break;
    case 2:
      assert.deepEqual(result, [2]);
      window.setTimeout(() => ++expectedCounter, 100 - TIMER_ERROR_TOLERANCE);
      break;
    case 3:
      assert.deepEqual(throttled.currentTime, 3);
      assert.deepEqual(result, [2, 3]);
      window.setTimeout(() => ++expectedCounter, 100 - TIMER_ERROR_TOLERANCE);
      break;
    case 4:
      assert.deepEqual(throttled.currentTime, 4);
      assert.deepEqual(result, [2, 3, 4]);
      assert.deepEqual(simulation.pendingEvents, []);
      done();
      break;
    default:
      assert.ok(false, `actualCounter was ${actualCounter}, which is not in range`);
      done();
    }
    ++actualCounter;
    if (actualCounter === 2) { // wait until actualCounter has been updated to change speed
      throttled.slowness = 100;
    }
  });
  throttled.slowness = 50;
});
