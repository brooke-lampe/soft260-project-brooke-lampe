/* exported Vertex City Route Bus Passenger */
/* globals shortestUndirectedPath Simulation Decision Agent */

class Vertex {
  constructor(name) {
    this.name = name;
    this.passengers = [];
  }

  addPassenger(passenger) {
    this.passengers.push(passenger);
  }

  removePassenger(passenger) {
    this.passengers.delete(passenger);
  }

  toString() {
    return this.name;
  }
}

class City extends Simulation {
  constructor(walkGraph, driveGraph) {
    super();
    this.walkGraph = walkGraph;
    this.driveGraph = driveGraph;
    this.routes = [];
    this._passengers = [];
  }

  chooseRandomWalkVertex() {
    return this.walkGraph.vertices[Math.floor(Math.random() * this.walkGraph.vertices.length)];
  }

  addPassenger(passenger) {
    this._passengers.push(passenger);
  }

  restart() {
    for (const passenger of this._passengers) {
      passenger.restart();
    }
  }
}

class Waypoint {
  constructor(route, vertex) {
    this.route = route;
    this.vertex = vertex;
    this._entry = undefined; // justifies this
    this._oldEntries = new Set(); // justifies this
    this._exit = undefined; // justified by this
  }

  _maybeDispose() {
    if (this._entry === undefined && this._oldEntries.size === 0) {
      const exit = this._exit;
      this._exit = undefined;
      exit.detachSource();
      this.route._disposeWaypoint(this); // eslint-disable-line no-underscore-dangle, (call from friend)
    }
  }

  get entry() {
    return this._entry;
  }

  set entry(entry) {
    console.assert(entry !== undefined, `Tried to clear the entry arc of the waypoint ${this} directly, instead of via detachEntry.`);
    console.assert(entry.destination === this, `Attempted to change the entry arc to the waypoint ${this} to the unrelated arc ${entry}.`);
    console.assert(this._entry === undefined || entry.source !== this._entry.source,
      `Attempted to overwrite the arc entering ${this} with an identical arc ${entry}.`);
    if (this._entry !== undefined) {
      this._oldEntries.add(this._entry);
    }
    this._entry = entry;
  }

  detachEntry(entry) {
    if (this._entry === entry) {
      this._entry = undefined;
    } else {
      console.assert(this._oldEntries.has(entry),
        `Attempted to detach the arc ${entry}, which is not an entry arc attached to the waypoint ${this}.`);
      this._oldEntries.delete(entry);
    }
    this._maybeDispose();
  }

  get exit() {
    return this._exit;
  }

  set exit(exit) {
    console.assert(exit !== undefined, `Attempted to remove the exit arc from the waypoint ${this}.`);
    console.assert(exit.source === this, `Attempted to change the exit arc from the waypoint ${this} to the unrelated arc ${exit}.`);
    console.assert(this._exit === undefined || exit.destination !== this._exit.destination,
      `Attempted to overwrite the arc exiting ${this} with an identical arc ${exit}.`);
    const oldExit = this._exit;
    this._exit = exit;
    if (oldExit !== undefined) {
      oldExit.detachSource();
    }
  }
}

class Arc {
  constructor(route, source, destination) {
    this.route = route;
    this.originalSource = source;
    this._source = source; // justifies this
    this._destination = destination; // justified by this
    this._buses = new Set(); // justify this
    // order matters:
    destination.entry = this;
    source.exit = this;
  }

  get source() {
    return this._source;
  }

  get destination() {
    return this._destination;
  }

  get edge() {
    return this.route.city.driveGraph.getEdge(this.originalSource.vertex, this.destination.vertex);
  }

  get next() {
    return this.destination.exit;
  }

  _maybeDispose() {
    if (this._source === undefined && this._buses.size === 0) {
      this._destination.detachEntry(this);
      this.route._disposeArc(this); // eslint-disable-line no-underscore-dangle, (call from friend)
    }
  }

  detachSource() {
    this._source = undefined;
    this._maybeDispose();
  }

  get buses() {
    return new Set(this._buses);
  }

  addBus(bus) {
    console.assert(bus.arc === this, `Attempted to add the bus ${bus} to the arc ${this} before associating it with that arc.`);
    this._buses.add(bus);
    this.route.buses.add(bus);
  }

  removeBus(bus) {
    console.assert(bus.arc !== this, `Attempted to remove the bus ${bus} from the arc ${this} while it was still associated with that arc.`);
    this._buses.delete(bus);
    if (bus.arc === undefined || bus.arc.route !== this.route) {
      this.route.removeBus(bus);
    }
    this._maybeDispose();
  }
}

class Route {
  constructor(city, firstVertex, secondVertex) {
    this.city = city;
    let index = undefined;
    for (let i = 0; i < city.routes.length; ++i) {
      if (city.routes[i] === undefined) {
        index = i;
        break;
      }
    }
    if (index !== undefined) {
      city.routes[index] = this;
    } else {
      city.routes.push(this);
    }
    this.waypoints = new Map(); // maps vertices to waypoints
    this.arcs = new Set();
    this.buses = new Set();
    this._addArc(firstVertex, secondVertex);
    this._addArc(secondVertex, firstVertex);
    city.restart();
  }

  retire() {
    if (this.buses.size === 0) {
      this.city.routes[this.city.routes.indexOf(this)] = undefined;
    } else {
      for (const bus of this.buses) {
        bus.stop();
      }
    }
    this.city.routes[this.city.routes.indexOf(this)] = undefined;
  }

  removeBus(bus) {
    this.buses.delete(bus);
  }

  has(vertex) {
    return this.waypoints.has(vertex);
  }

  hasInCore(vertex) {
    const waypoint = this.waypoints.get(vertex);
    if (waypoint !== undefined) {
      const firstArc = waypoint.exit;
      const seen = new Set();
      for (let arc = firstArc.next; !seen.has(arc); arc = arc.next) {
        if (arc === firstArc) {
          return true;
        }
        seen.add(arc);
      }
    }
    return false;
  }

  getArc(source) {
    console.assert(this.has(source), `Tried to get the arc corresponding to ${source}, which is not part of the route ${this}.`);
    return this.waypoints.get(source).exit;
  }

  _addArc(source, destination) {
    let sourceWaypoint = this.waypoints.get(source);
    if (sourceWaypoint === undefined) {
      sourceWaypoint = new Waypoint(this, source);
      this.waypoints.set(source, sourceWaypoint);
    }
    let destinationWaypoint = this.waypoints.get(destination);
    if (destinationWaypoint === undefined) {
      destinationWaypoint = new Waypoint(this, destination);
      this.waypoints.set(destination, destinationWaypoint);
    }
    this.arcs.add(new Arc(this, sourceWaypoint, destinationWaypoint));
  }

  patch(...path) {
    // order matters:
    for (let i = path.length - 1; i--;) {
      this._addArc(path[i], path[i + 1]);
    }
    this.city.restart();
  }

  _disposeWaypoint(waypoint) {
    const success = this.waypoints.delete(waypoint.vertex);
    console.assert(success,
      `Tried to dispose of the waypoint ${waypoint} from the route ${this}, but that waypoint is not part of the route.`);
  }

  _disposeArc(arc) {
    const success = this.arcs.delete(arc);
    console.assert(success, `Tried to dispose of the arc ${arc} from the route ${this}, but that arc is not part of the route.`);
  }

  getNextArrival(vertex, minimumETA = 0.0) {
    let result = undefined;
    let bestETA = Infinity;
    if (this.has(vertex)) {
      for (const bus of this.buses) {
        const eta = bus.getETA(vertex, minimumETA);
        if (eta < bestETA) {
          result = bus;
          bestETA = eta;
        }
      }
    }
    return {
      bus: result,
      eta: bestETA,
    };
  }
}

class Bus extends Agent {
  constructor(arc, capacity = 1, unloadingDelay = 1.0, loadingDelay = 1.0) {
    super(arc.route.city);
    this._arc = arc;
    arc.addBus(this);
    this._departureTime = undefined;
    this._arrivalTime = undefined;
    this._alightingPassenger = undefined;
    this.boardingIndex = undefined;
    this.boardingPassenger = undefined;
    this._waitingTime = undefined;
    this.passengers = new Array(capacity).fill(undefined);
    this.unloadingDelay = unloadingDelay;
    this.loadingDelay = loadingDelay;
    arc.route.city.restart();
  }

  get vertex() {
    if (this._departureTime !== undefined && this._departureTime < this.simulation.currentTime) {
      return undefined;
    }
    return this._arc.originalSource.vertex;
  }

  get arc() {
    return this._arc;
  }

  get eta() {
    if (this._arrivalTime !== undefined) {
      return this._arrivalTime - this.simulation.currentTime;
    }
    return undefined;
  }

  get transitDelay() {
    if (this._arrivalTime !== undefined) {
      return this._arrivalTime - this._departureTime;
    }
    return undefined;
  }

  get progress() {
    if (this._arrivalTime !== undefined) {
      return (this.simulation.currentTime - this._departureTime) / (this._arrivalTime - this._departureTime);
    }
    return undefined;
  }

  get capacity() {
    return this.passengers.length;
  }

  addPassenger(passenger) {
    const index = this.passengers.indexOf(undefined);
    console.assert(index > -1, `Added passenger ${passenger} to already full bus ${this}.`);
    this.passengers[index] = passenger;
  }

  removePassenger(passenger) {
    const index = this.passengers.indexOf(passenger);
    console.assert(index > -1, `Removed passenger ${passenger} from the bus ${this} on which they are not riding.`);
    this.passengers[index] = undefined;
  }

  getETA(vertex, minimumETA = 0.0) {
    if (minimumETA <= 0.0 && this.vertex === vertex) {
      for (const passenger of this.passengers) {
        if (passenger === undefined || passenger.immediateDestination === this.vertex) {
          return 0.0;
        }
      }
    }
    let result = this.eta;
    if (result === undefined) {
      result = this._arc.edge.weight;
    }
    const seen = new Set();
    for (let arc = this._arc.next; !seen.has(arc); arc = arc.next) {
      if (result >= minimumETA) {
        if (arc.originalSource.vertex === vertex) {
          return result;
        }
        seen.add(arc);
      }
      result += arc.edge.weight; // optimism: ignore loading and unloading delays
    }
    return Infinity;
  }

  _arrive() {
    // order matters:
    const oldArc = this._arc;
    this._arc = this._arc.next;
    this._arc.addBus(this);
    oldArc.removeBus(this);
    this._departureTime = undefined;
    this._arrivalTime = undefined;
  }

  stop() {
    const arc = this._arc;
    this._arc = undefined;
    arc.removeBus(this);
    arc.route.city.restart();
  }

  _decide() {
    console.assert(this._arc !== undefined, `Attempted to make a decision for the bus ${this}, which has been stopped.`);
    // wait (unloading)
    if (this._alightingPassenger !== undefined) {
      return new Decision(this._waitingTime - this.simulation.currentTime, () => {
        this._alightingPassenger.endAlight(this.vertex);
        this._alightingPassenger = undefined;
        this._waitingTime = undefined;
      });
    }
    // wait (loading)
    if (this.boardingPassenger !== undefined) {
      return new Decision(this._waitingTime - this.simulation.currentTime, () => {
        this.boardingPassenger.endBoard(this);
        this.boardingIndex = undefined;
        this.boardingPassenger = undefined;
        this._waitingTime = undefined;
      });
    }
    // drive
    if (this.vertex === undefined) {
      return new Decision(this.eta, () => {
        this._arrive();
      });
    }
    // unload
    for (const passenger of this.passengers) {
      if (passenger !== undefined && passenger.immediateDestination === this.vertex) {
        passenger.beginAlight(this.unloadingDelay);
        this._alightingPassenger = passenger;
        this._waitingTime = this.simulation.currentTime + this.unloadingDelay;
        return new Decision(this.unloadingDelay, () => {
          passenger.endAlight(this.vertex);
          this._alightingPassenger = undefined;
          this._waitingTime = undefined;
        });
      }
    }
    // load
    const emptyIndex = this.passengers.indexOf(undefined);
    if (emptyIndex > -1) {
      for (const passenger of this.vertex.passengers) {
        if (passenger !== undefined && passenger.isWaitingFor(this)) {
          passenger.beginBoard(this.loadingDelay);
          this.boardingIndex = emptyIndex;
          this.boardingPassenger = passenger;
          this._waitingTime = this.simulation.currentTime + this.loadingDelay;
          return new Decision(this.loadingDelay, () => {
            passenger.endBoard(this);
            this.boardingIndex = undefined;
            this.boardingPassenger = undefined;
            this._waitingTime = undefined;
          });
        }
      }
    } else {
      for (const passenger of this.vertex.passengers) {
        if (passenger !== undefined && passenger.isWaitingFor(this)) {
          passenger.restart();
        }
      }
    }
    // depart
    const delay = this._arc.edge.weight;
    this._departureTime = this.simulation.currentTime;
    this._arrivalTime = this.simulation.currentTime + delay;
    return new Decision(delay, () => {
      this._arrive();
    });
  }
}

class PlanningVertex {
  constructor(route, destination, eta, isStarter = false) {
    console.assert(Number.isFinite(eta), `Tried to plan for the route ${route} to reach ${destination} after an infinite amount of time.`);
    this.route = route;
    this.destination = destination;
    this.eta = eta;
    this.isStarter = isStarter;
  }
}

class PlanningEdge {
  constructor(weight) {
    this.weight = weight;
  }
}

class PlanningGraph {
  constructor(city) {
    this.city = city;
  }

  getNeighbors(vertex) {
    let result = [];
    for (const route of this.city.routes) {
      if (route !== undefined && (route !== vertex.route || vertex.isStarter)) {
        const appointment = route.getNextArrival(vertex.destination, vertex.eta);
        if (appointment.bus !== undefined) {
          const firstArc = route.getArc(vertex.destination);
          const seen = new Set();
          seen.add(firstArc);
          for (let eta = appointment.eta + firstArc.edge.weight, arc = firstArc.next; !seen.has(arc); eta += arc.edge.weight, arc = arc.next) {
            result.push(new PlanningVertex(route, arc.originalSource.vertex, eta));
            seen.add(arc);
          }
        }
      }
    }
    result = result.reverse(); // FIXME: hack so that shortestUndirectedPath will take longer bus rides
    for (const neighbor of this.city.walkGraph.getNeighbors(vertex.destination)) {
      const edge = this.city.walkGraph.getEdge(vertex.destination, neighbor);
      result.push(new PlanningVertex(undefined, neighbor, vertex.eta + edge.weight));
    }
    return result;
  }

  getEdge(source, destination) { // eslint-disable-line class-methods-use-this
    return new PlanningEdge(destination.eta - source.eta);
  }
}

class Passenger extends Agent {
  constructor(city, name, inactiveTime, vertex) {
    super(city);
    city.addPassenger(this);
    this.name = name;
    this._vertex = undefined;
    this.source = undefined;
    this.destination = undefined;
    this._bus = undefined;
    this._boardingBeginTime = undefined;
    this._boardingEndTime = undefined;
    this._alightingBeginTime = undefined;
    this._alightingEndTime = undefined;
    this._departureTime = undefined;
    this._arrivalTime = undefined;
    this.inactiveTime = inactiveTime;
    this.plan = [new PlanningVertex(undefined, this.vertex, this.inactiveTime)];
    this.vertex = vertex;
  }

  get vertex() {
    if (this._departureTime !== undefined && this._departureTime < this.simulation.currentTime) {
      return undefined;
    }
    return this._vertex;
  }

  set vertex(vertex) {
    if (this._vertex !== undefined) {
      this._vertex.removePassenger(this);
    }
    if (this._bus !== undefined) {
      this._bus.removePassenger(this);
    }
    this._vertex = vertex;
    this._bus = undefined;
    if (vertex !== undefined) {
      vertex.addPassenger(this);
      if (vertex === this.destination) {
        if (this.source !== this.destination) {
          this.source = this.destination;
        } else {
          this.source = undefined;
          this.destination = undefined;
        }
      }
    }
    this._departureTime = undefined;
    this._arrivalTime = undefined;
  }

  get bus() {
    return this._bus;
  }

  set bus(bus) {
    if (this._vertex !== undefined) {
      this._vertex.removePassenger(this);
    }
    if (this._bus !== undefined) {
      this._bus.removePassenger(this);
    }
    this._vertex = undefined;
    this._bus = bus;
    if (bus !== undefined) {
      bus.addPassenger(this);
    }
    this._departureTime = undefined;
    this._arrivalTime = undefined;
  }

  get boarding() {
    return this._boardingBeginTime !== undefined;
  }

  get boardingETA() {
    return this._boardingEndTime - this.simulation.currentTime;
  }

  beginBoard(delay) {
    this._boardingBeginTime = this.simulation.currentTime;
    this._boardingEndTime = this.simulation.currentTime + delay;
  }

  endBoard(bus) {
    this._boardingBeginTime = undefined;
    this._boardingEndTime = undefined;
    this.bus = bus;
    this.restart();
  }

  get alighting() {
    return this._alightingBeginTime !== undefined;
  }

  get alightingETA() {
    return this._alightingEndTime - this.simulation.currentTime;
  }

  beginAlight(delay) {
    this._alightingBeginTime = this.simulation.currentTime;
    this._alightingEndTime = this.simulation.currentTime + delay;
  }

  endAlight(vertex) {
    this._alightingBeginTime = undefined;
    this._alightingEndTime = undefined;
    this.vertex = vertex;
    this.restart();
  }

  get eta() {
    if (this._arrivalTime !== undefined) {
      return this._arrivalTime - this.simulation.currentTime;
    }
    return undefined;
  }

  get transitDelay() {
    if (this._arrivalTime !== undefined) {
      return this._arrivalTime - this._departureTime;
    }
    return undefined;
  }

  get progress() {
    if (this._arrivalTime !== undefined) {
      return (this.simulation.currentTime - this._departureTime) / (this._arrivalTime - this._departureTime);
    }
    return undefined;
  }

  isWaitingFor(bus) {
    return this.bus === undefined && this._boardingBeginTime === undefined && bus.arc.route === this.plan[0].route;
  }

  get walkingSource() {
    if (this._departureTime !== undefined && this._vertex !== this.immediateDestination) {
      console.assert(this.plan[0].route === undefined, `Found a walking source for ${this}, who is supposedly waiting for or riding a bus.`);
      return this._vertex;
    }
    return undefined;
  }

  get immediateDestination() {
    return this.plan[0].destination;
  }

  _arrive() {
    this.vertex = this.immediateDestination;
  }

  _plan() {
    this._departureTime = undefined;
    this._arrivalTime = undefined;
    console.assert(this.vertex !== undefined,
      `Attempted to plan a route for the passenger ${this} using _plan while they are still in transit (use _planFromBus instead).`);
    if (this.destination === undefined) {
      this.source = this.vertex;
      this.destination = this.simulation.chooseRandomWalkVertex();
    }
    if (this.source !== this.destination) {
      const starter = new PlanningVertex(undefined, this.vertex, 0.0, true);
      this.plan = shortestUndirectedPath(new PlanningGraph(this.simulation), starter, (vertex) => vertex.destination === this.destination,
        (vertex) => vertex.destination);
      if (this.plan !== undefined) {
        const discarded = this.plan.shift();
        console.assert(discarded === starter, `The computed plan ${discarded}, ${this.plan} does not begin at the source ${this.source}.`);
        console.assert(this.plan.top().destination === this.destination,
          `The computed plan ${discarded}, ${this.plan} does not end at the destination ${this.destination}.`);
        return;
      }
    }
    this.plan = [new PlanningVertex(undefined, this.vertex, this.inactiveTime)];
  }

  _planFromBus() {
    console.assert(this.vertex === undefined,
      `Attempted to plan a route for the passenger ${this} using _planFromBus while they are not in transit (use _plan instead).`);
    const nextStop = this.bus.vertex || this.bus.arc.next.originalSource.vertex;
    const starter = new PlanningVertex(this.bus.arc.route, nextStop, this.bus.getETA(nextStop), true);
    this.plan = shortestUndirectedPath(new PlanningGraph(this.simulation), starter, (vertex) => vertex.destination === this.destination,
      (vertex) => vertex.destination);
    if (this.plan !== undefined) {
      if (this.plan.length > 1 && this.plan[0].route === this.plan[1].route) {
        const discarded = this.plan.shift();
        console.assert(discarded === starter, `The computed plan ${discarded}, ${this.plan} does not begin at the source ${nextStop}.`);
      }
      console.assert(this.plan.top().destination === this.destination, `The computed plan ${this.plan} does not end at the destination ${this.destination}.`);
      return;
    }
    this.plan = [starter];
  }

  _decide() {
    // ride
    if (this.bus !== undefined) {
      this._planFromBus();
      return undefined;
    }
    // walk
    if (this.vertex === undefined) {
      return new Decision(this.eta, () => {
        this._arrive();
      });
    }
    // (remaining options require planning)
    this._plan();
    // wait for bus (boarding will be handled by the bus)
    if (this.plan[0].route !== undefined) {
      return undefined;
    }
    // depart on foot
    const delay = this.plan[0].eta;
    this._departureTime = this.simulation.currentTime;
    this._arrivalTime = this.simulation.currentTime + delay;
    return new Decision(delay, () => {
      this._arrive();
    });
  }
}
