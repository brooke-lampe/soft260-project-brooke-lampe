/* exported ThrottledSimulation */
/* globals SimulationEvent */

class ThrottledSimulation {
  constructor(simulation, update) {
    this.simulation = simulation;
    this._lastWallTime = Date.now();
    this._slowness = Infinity;
    this._timeout = undefined;
    this.update = update;
  }

  get currentTime() {
    return this.simulation.currentTime;
  }

  get nextTime() {
    return this.simulation.nextTime;
  }

  get slowness() {
    return this._slowness;
  }

  set slowness(slowness) {
    console.assert(slowness > 0, `Attempted to throttle the throttled simulation ${this} to the slowness ${slowness} (speed ${1 / slowness}).`);
    const wallTime = Date.now();
    const targetTime = this.currentTime + (wallTime - this._lastWallTime) / this._slowness;
    if (targetTime > this.currentTime) {
      if (this.nextTime === undefined || targetTime < this.nextTime) {
        this.simulation.addEvent(new SimulationEvent(targetTime, () => undefined));
      }
      this.simulation.step();
    }
    this._lastWallTime = wallTime;
    this._slowness = slowness;
    if (this._timeout !== undefined) {
      window.clearTimeout(this._timeout);
      this._timeout = undefined;
    }
    const delay = slowness * (this.nextTime - this.currentTime);
    if (delay > 0 && Number.isFinite(delay)) {
      this._timeout = window.setTimeout(() => {
        this.synchronize(); // (indirect self-call)
      }, delay);
    }
    this.update();
  }

  synchronize() {
    this.slowness = this.slowness; // call setter for side-effects
  }
}
