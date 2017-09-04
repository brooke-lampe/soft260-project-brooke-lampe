/* exported Placement PositionedVertex PositionedEdge */
/* globals Vertex UndirectedEdge */

const PI = Math.PI;
const TAU = 2 * PI;

function toVector(first, second) {
  return [second[0] - first[0], second[1] - first[1]];
}

function toMagnitude([dx, dy]) {
  return Math.sqrt(dx * dx + dy * dy);
}

function toDirection([dx, dy], referenceDirection = undefined) {
  const result = Math.atan2(dy, dx);
  if (referenceDirection !== undefined) {
    let delta = (result - referenceDirection) % TAU;
    if (delta <= -PI) {
      delta += TAU;
    } else if (delta > PI) {
      delta -= TAU;
    }
    return referenceDirection + delta;
  }
  return result;
}

function toUnit([dx, dy]) {
  const magnitude = toMagnitude([dx, dy]);
  return [dx / magnitude, dy / magnitude];
}

function toUnitNormal(first, second) {
  const [dx, dy] = toVector(first, second);
  return toUnit([-dy, dx]);
}

function toOffsetPoint(previous, current, next, offsetMagnitude) {
  const [previousNormalX, previousNormalY] = toUnitNormal(previous, current);
  const [nextNormalX, nextNormalY] = toUnitNormal(current, next);
  const [offsetDX, offsetDY] = [previousNormalX + nextNormalX, previousNormalY + nextNormalY];
  const dotProduct = previousNormalX * offsetDX + previousNormalY * offsetDY;
  const scale = offsetMagnitude / dotProduct;
  console.assert(!Number.isNaN(offsetDX) && !Number.isNaN(offsetDY),
    `Got NaN while computing offset point from the polyline ${[previous, current, next]}.`);
  return [current[0] + scale * offsetDX, current[1] + scale * offsetDY];
}

function toOffsetPath(path, offsetMagnitude) {
  console.assert(path.length > 1, 'Attempted to constuct an offset path from a degenerate path.');
  const beginningMirror = [2 * path[0][0] - path[1][0], 2 * path[0][1] - path[1][1]];
  const endingMirror = [2 * path.top(0)[0] - path.top(1)[0], 2 * path.top(0)[1] - path.top(1)[1]];
  const extendedPath = [];
  extendedPath.push(beginningMirror, ...path, endingMirror);
  const result = [];
  for (let i = 1; i < extendedPath.length - 1; ++i) {
    result.push(toOffsetPoint(extendedPath[i - 1], extendedPath[i], extendedPath[i + 1], offsetMagnitude));
  }
  return result;
}

class Placement {
  constructor(position, theta, progress = undefined) {
    this.position = position;
    this.theta = theta;
    this.progress = progress;
  }

  distanceTo(other) {
    return toMagnitude(toVector(this.position, other.position));
  }

  interpolate(other, progress) {
    const fraction = (progress - this.progress) / (other.progress - this.progress);
    const complement = 1 - fraction;
    const position = [complement * this.position[0] + fraction * other.position[0], complement * this.position[1] + fraction * other.position[1]];
    const theta = complement * this.theta + fraction * other.theta;
    return new Placement(position, theta, progress);
  }

  toString() {
    return `translate(${this.position[0]}, ${this.position[1]}) rotate(${this.theta * 360 / TAU}, 0, 0)`;
  }
}

function toTurningPoint([cornerX, cornerY], [armX, armY], turningDistance) {
  const vector = toVector([cornerX, cornerY], [armX, armY]);
  if (toMagnitude(vector) < 2 * turningDistance) {
    return [(cornerX + armX) / 2, (cornerY + armY) / 2];
  }
  const [dx, dy] = toUnit(vector);
  return [cornerX + turningDistance * dx, cornerY + turningDistance * dy];
}

function toTurningPath(path, turningDistance) {
  console.assert(path.length > 1, 'Attempted to constuct a turning path from a degenerate path.');
  console.assert(turningDistance > 0.0, 'Attempted to constuct a turning path with no turning distance.');
  const result = [];
  let direction = toDirection(toVector(path[0], path[1]));
  result.push(new Placement(path[0], direction));
  for (let i = 1; i < path.length - 1; ++i) {
    const startingDirection = toDirection(toVector(path[i - 1], path[i]), direction);
    direction = toDirection(toVector(path[i], path[i + 1]), startingDirection);
    const middleDirection = (startingDirection + direction) / 2;
    result.push(new Placement(toTurningPoint(path[i], path[i - 1], turningDistance), startingDirection));
    result.push(new Placement(path[i], middleDirection));
    result.push(new Placement(toTurningPoint(path[i], path[i + 1], turningDistance), direction));
  }
  result.push(new Placement(path.top(0), toDirection(toVector(path.top(1), path.top(0)), direction)));
  return result;
}

class Track {
  constructor(path, offsetMagnitude, turningDistance) {
    console.assert(path.length > 1, 'Attempted to constuct a track from a degenerate path.');
    const offsetPath = toOffsetPath(path, offsetMagnitude);
    this.placements = toTurningPath(offsetPath, turningDistance);
    let totalDistance = 0.0;
    for (let i = 0; i < this.placements.length - 1; ++i) {
      const [first, second] = this.placements.slice(i, i + 2);
      totalDistance += first.distanceTo(second);
    }
    console.assert(!Number.isNaN(totalDistance), `Got NaN while computing progress along the track ${this.placements}.`);
    let accumulatedDistance = 0.0;
    this.placements[0].progress = 0.0;
    for (let i = 0; i < this.placements.length - 1; ++i) {
      const [first, second] = this.placements.slice(i, i + 2);
      accumulatedDistance += first.distanceTo(second);
      second.progress = accumulatedDistance / totalDistance;
    }
  }

  getPlacements(startingProgress = 0) {
    for (let i = 0; i < this.placements.length - 1; ++i) {
      if (this.placements[i + 1].progress > startingProgress) {
        return [this.placements[i].interpolate(this.placements[i + 1], startingProgress)].concat(this.placements.slice(i + 1));
      }
    }
    console.assert(false, `Attempted to get placements using an out-of-bounds starting progress, ${startingProgress}`);
    return [];
  }
}

class PositionedVertex extends Vertex {
  constructor(name, position) {
    super(name);
    this.position = position;
  }
}

class PositionedEdge extends UndirectedEdge {
  constructor(source, path, weight, destination) {
    super(weight);
    this.source = source;
    this.destination = destination;
    this.path = path;
  }

  getTrack(offsetMagnitude, turningDistance) {
    return new Track(this.path, offsetMagnitude, turningDistance);
  }

  reverse() {
    return new PositionedEdge(this.destination, this.path.reverse(), this.weight, this.source);
  }
}
