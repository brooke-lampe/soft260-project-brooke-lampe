/* exported SimulationEvent Simulation Decision Agent */

class SimulationEvent {
  constructor(time, effect) {
    this.time = time;
    this.effect = effect;
  }
}

class Simulation {
  constructor() {
    this.currentTime = 0;
    this.pendingEvents = [];
  }

  addEvent(event) {
    console.assert(event.time > this.currentTime,
      `Added the event ${event} at time ${event.time}, which is not in the future because the current time is ${this.currentTime}.`);
    this.pendingEvents.push(event);
  }

  removeEvent(event) {
    this.pendingEvents.delete(event);
  }

  get nextTime() {
    const nextIndex = this.pendingEvents.indexOfMinimum((event) => event.time);
    return nextIndex !== undefined ? this.pendingEvents[nextIndex].time : undefined;
  }

  _dequeueNextEvent(horizon = Infinity) {
    const nextIndex = this.pendingEvents.indexOfMinimum((event) => event.time <= horizon ? event.time : Infinity);
    if (nextIndex === undefined || this.pendingEvents[nextIndex].time > horizon) {
      return undefined;
    }
    return this.pendingEvents.remove(nextIndex);
  }

  step() {
    for (let event = this._dequeueNextEvent(); event !== undefined; event = this._dequeueNextEvent(this.currentTime)) {
      this.currentTime = event.time;
      event.effect();
    }
    return this.currentTime;
  }
}

class Decision {
  constructor(delay, effect) {
    this.delay = delay;
    this.effect = effect;
  }
}

class Agent {
  constructor(simulation) {
    this.simulation = simulation;
    this._nextEvent = undefined;
  }

  _decide() { // eslint-disable-line class-methods-use-this, (to be overridden)
    return undefined;
  }

  restart() {
    if (this._nextEvent !== undefined) {
      this.simulation.removeEvent(this._nextEvent);
    }
    const decision = this._decide();
    if (decision !== undefined) {
      this._nextEvent = new SimulationEvent(this.simulation.currentTime + decision.delay, () => {
        decision.effect();
        this.restart();
      });
      this.simulation.addEvent(this._nextEvent);
    } else {
      this._nextEvent = undefined;
    }
  }

  start() {
    this.restart();
  }
}
