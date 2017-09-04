/* exported Coprogram block UNPAUSE pause */

const runningCoprograms = [];

class Coprogram {
  constructor(main) {
    this._main = main;
    this._running = false;
    this.state = main();
    this.inputQueue = [];
  }

  _continue(input) {
    runningCoprograms.push(this);
    this.state.next(input);
    while (this.inputQueue.length > 0) {
      this.state.next(this.inputQueue.shift());
    }
    runningCoprograms.pop();
  }

  run() {
    console.assert(!this._running, `Tried to run the coprogram ${this._main} when it is already running.`);
    this._running = true;
    this._continue();
  }

  unblock(input) {
    if (!this._running || runningCoprograms.includes(this)) {
      this.inputQueue.push(input);
    } else {
      console.assert(this.inputQueue.length === 0, `Found coprogram ${this} blocked waiting for input when there was already input in its queue.`);
      this._continue(input);
    }
  }
}

function*block(arm, disarm) {
  const coprogram = runningCoprograms.top();
  arm((input) => coprogram.unblock(input));
  const result = yield;
  if (disarm !== undefined) {
    disarm();
  }
  return result;
}

const UNPAUSE = Symbol('UNPAUSE');

function*pause(delay) {
  return yield* block((unblock) => {
    if (Number.isFinite(delay)) {
      window.setTimeout(() => {
        unblock(UNPAUSE);
      }, delay);
    }
  });
}
