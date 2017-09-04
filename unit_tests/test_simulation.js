QUnit.module('simulation.js');
/* globals QUnit SimulationEvent Simulation Decision Agent */
/* eslint-disable no-magic-numbers */

QUnit.test('step through events added up-front', (assert) => {
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
  assert.deepEqual(result, []);
  let time = simulation.step();
  assert.deepEqual(time, 2);
  assert.deepEqual(result, [2]);
  time = simulation.step();
  assert.deepEqual(time, 3);
  assert.deepEqual(result, [2, 3]);
  time = simulation.step();
  assert.deepEqual(time, 4);
  assert.deepEqual(result, [2, 3, 4]);
  time = simulation.step();
  assert.deepEqual(time, 4);
});

QUnit.test('step through events added up-front and mid-simulation', (assert) => {
  const simulation = new Simulation();
  const result = [];
  simulation.addEvent(new SimulationEvent(2, () => {
    result.push(2);
    simulation.addEvent(new SimulationEvent(3, () => {
      result.push(3);
    }));
  }));
  simulation.addEvent(new SimulationEvent(4, () => {
    result.push(4);
  }));
  assert.deepEqual(result, []);
  let time = simulation.step();
  assert.deepEqual(time, 2);
  assert.deepEqual(result, [2]);
  time = simulation.step();
  assert.deepEqual(time, 3);
  assert.deepEqual(result, [2, 3]);
  time = simulation.step();
  assert.deepEqual(time, 4);
  assert.deepEqual(result, [2, 3, 4]);
  time = simulation.step();
  assert.deepEqual(time, 4);
});

QUnit.test('step through events added up-front but removed mid-simulation', (assert) => {
  const simulation = new Simulation();
  const result = [];
  const moribund = new SimulationEvent(3, () => {
    result.push(3);
  });
  simulation.addEvent(moribund);
  simulation.addEvent(new SimulationEvent(2, () => {
    result.push(2);
    simulation.removeEvent(moribund);
  }));
  simulation.addEvent(new SimulationEvent(4, () => {
    result.push(4);
  }));
  assert.deepEqual(result, []);
  let time = simulation.step();
  assert.deepEqual(time, 2);
  assert.deepEqual(result, [2]);
  time = simulation.step();
  assert.deepEqual(time, 4);
  assert.deepEqual(result, [2, 4]);
  time = simulation.step();
  assert.deepEqual(time, 4);
});

QUnit.test('step through simultaneous events added up-front', (assert) => {
  const simulation = new Simulation();
  const result = [];
  simulation.addEvent(new SimulationEvent(2, () => {
    result.push(2);
  }));
  simulation.addEvent(new SimulationEvent(2, () => {
    result.push(2);
  }));
  simulation.addEvent(new SimulationEvent(2, () => {
    result.push(2);
  }));
  assert.deepEqual(result, []);
  let time = simulation.step();
  assert.deepEqual(time, 2);
  assert.deepEqual(result, [2, 2, 2]);
  time = simulation.step();
  assert.deepEqual(time, 2);
});

QUnit.test('step through simulation of a do-nothing agent', (assert) => {
  const simulation = new Simulation();
  const agent = new Agent();
  let time = simulation.step();
  assert.deepEqual(time, 0);
  agent.start();
  time = simulation.step();
  assert.deepEqual(time, 0);
});

QUnit.test('step through simulation of a counting agent', (assert) => {
  const simulation = new Simulation();
  const CountingAgent = class extends Agent {
    constructor() {
      super(simulation);
      this.counter = 0;
    }
    _decide() {
      return new Decision(1, () => {
        ++this.counter;
      });
    }
  };
  const agent = new CountingAgent();
  let time = simulation.step();
  assert.deepEqual(time, 0);
  assert.deepEqual(agent.counter, 0);
  agent.start();
  time = simulation.step();
  assert.deepEqual(time, 1);
  assert.deepEqual(agent.counter, 1);
  time = simulation.step();
  assert.deepEqual(time, 2);
  assert.deepEqual(agent.counter, 2);
});

QUnit.test('step through simulation of a counting agent restarted mid-simulation', (assert) => {
  const simulation = new Simulation();
  const CountingAgent = class extends Agent {
    constructor() {
      super(simulation);
      this.counter = 0;
    }
    _decide() {
      return new Decision(1, () => {
        ++this.counter;
      });
    }
  };
  const agent = new CountingAgent();
  let time = simulation.step();
  assert.deepEqual(time, 0);
  assert.deepEqual(agent.counter, 0);
  agent.start();
  time = simulation.step();
  assert.deepEqual(time, 1);
  assert.deepEqual(agent.counter, 1);
  simulation.addEvent(new SimulationEvent(1.5, () => {
    agent.restart();
  }));
  time = simulation.step();
  assert.deepEqual(time, 1.5);
  assert.deepEqual(agent.counter, 1);
  time = simulation.step();
  assert.deepEqual(time, 2.5);
  assert.deepEqual(agent.counter, 2);
});
