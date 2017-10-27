/* exported UndirectedEdge UndirectedGraph shortestUndirectedPath */
/* globals identity PriorityQueue */

class UndirectedEdge {
  constructor(weight) {
    this.weight = weight;
  }

  reverse() {
    return this;
  }
}

class UndirectedGraph {
  constructor() {
    this.vertices = [];
    this.edges = [];
    this.adjacencyMatrix = [];
  }

  addVertex(vertex) {
    this.vertices.push(vertex);
    for (const adjacencyColumn of this.adjacencyMatrix) {
      adjacencyColumn.push(undefined);
      console.assert(adjacencyColumn.length === this.vertices.length, 'Vertex count does not match adjacency matrix height.');
    }
    this.adjacencyMatrix.push(this.vertices.concat().fill(undefined));
    console.assert(this.adjacencyMatrix.length === this.vertices.length, 'Vertex count does not match adjacency matrix width.');
  }

  addEdge(source, edge, destination) {
    const sourceIndex = this.vertices.indexOf(source);
    console.assert(sourceIndex >= 0, `Edge ${edge} added to nonexistent vertex ${source}.`);
    const destinationIndex = this.vertices.indexOf(destination);
    console.assert(destinationIndex >= 0, `Edge ${edge} added to nonexistent vertex ${destination}.`);
    if (sourceIndex !== destinationIndex) {
      console.assert(this.adjacencyMatrix[sourceIndex][destinationIndex] === undefined,
        `Added edge ${edge}, which conflicts with the edge ${this.adjacencyMatrix[sourceIndex][destinationIndex]}.`);
      this.edges.push(edge);
      this.adjacencyMatrix[sourceIndex][destinationIndex] = edge;
      this.adjacencyMatrix[destinationIndex][sourceIndex] = edge.reverse();
    }
  }

  getNeighbors(vertex) {
    const vertexIndex = this.vertices.indexOf(vertex);
    console.assert(vertexIndex >= 0, `Cannot get neighbors of nonexistent vertex ${vertex}.`);
    const adjacencyColumn = this.adjacencyMatrix[vertexIndex];
    const result = [];
    for (let i = this.vertices.length; i--;) {
      if (adjacencyColumn[i] !== undefined) {
        result.push(this.vertices[i]);
      }
    }
    return result;
  }

  getEdge(source, destination) {
    const sourceIndex = this.vertices.indexOf(source);
    console.assert(sourceIndex >= 0, `Cannot get edge incident on nonexistent vertex ${source}.`);
    const destinationIndex = this.vertices.indexOf(destination);
    console.assert(destinationIndex >= 0, `Cannot get edge incident on nonexistent vertex ${destination}.`);
    return this.adjacencyMatrix[sourceIndex][destinationIndex];
  }
}

function shortestUndirectedPath(graph, source, destinationPredicate, projection = identity) {
  const distance = new Map();
  distance.set(source, 0);

  const path = new Map();
  path.set(source, undefined);

  const visited = new Set();
  visited.add(projection(source));

  function metric(vertex) {
    if (distance.get(vertex) === undefined) {
      distance.set(vertex, Infinity);
    }
    return distance.get(vertex);
  }

  const q = new PriorityQueue(metric);
  q.enqueue(source);

  const contains = new Set();
  contains.add(source);

  let destination = undefined;

  while (q.elements.length >= 0) {
    const workitem = q.dequeue();
    if (workitem === undefined) {
      return undefined;
    }
    if (destinationPredicate(workitem)) {
      destination = workitem;
      break;
    }
    visited.add(projection(workitem));
    const neighbors = graph.getNeighbors(workitem);
    for (const neighbor of neighbors) {
      if (!visited.has(projection(neighbor))) {
        const edge = graph.getEdge(workitem, neighbor);
        const possible = distance.get(workitem) + edge.weight;
        if (!contains.has(projection(neighbor))) {
          distance.set(neighbor, possible);
          path.set(neighbor, workitem);
          q.enqueue(neighbor);
          contains.add(neighbor);
        }
        if (possible < distance.get(neighbor)) {
          distance.set(neighbor, possible);
          path.set(neighbor, workitem);
        }
      }
    }
  }

  if (destination === undefined) {
    return undefined;
  }

  const array = [destination];
  let vertex = path.get(destination);

  while (vertex !== undefined) {
    array.unshift(vertex);
    vertex = path.get(vertex);
  }

  /*
  if (array.length === 1) {
    console.assert(array[0] === source, 'Path failed to begin at the source');
    console.assert(destinationPredicate(array[0]), 'Endpoint failed to satisfy the destination predicate');
  } else {
    const endpoint = array.pop();
    console.assert(array[0] === source, 'Path failed to begin at the source');
    console.assert(destinationPredicate(endpoint), 'Endpoint failed to satisfy the destination predicate');
    console.assert(!array.every(destinationPredicate), 'Non-endpoint vertices satisfy destination predicate');
    array.push(endpoint);
    if (graph.adjacencyMatrix !== undefined) {
      console.assert(array.every((value, index) => graph.adjacencyMatrix[index][index + 1] !== undefined || array.length <= index + 1), 'Adjacent vertices do not correspond to edges');
    }
  }
  */

  return array.concat();

/*
  const path = new Map();
  path.set(source, undefined);

  const visited = new Set();
  visited.add(projection(source));

  const worklist = [source];

  let destination = undefined;

  while (worklist.length > 0) {
    const workitem = worklist.shift();
    const neighbors = graph.getNeighbors(workitem);
    for (const neighbor of neighbors) {
      if (!visited.has(projection(neighbor))) {
        path.set(neighbor, workitem);
        worklist.push(neighbor);
        visited.add(projection(neighbor));
      }
    }
    if (destinationPredicate(workitem)) {
      destination = workitem;
      break;
    }
  }

  if (destination === undefined) {
    return undefined;
  }

  const array = [destination];
  let vertex = path.get(destination);

  while (vertex !== undefined) {
    array.unshift(vertex);
    vertex = path.get(vertex);
  }

  if (array.length === 1) {
    console.assert(array[0] === source, 'Path failed to begin at the source');
    console.assert(destinationPredicate(array[0]), 'Endpoint failed to satisfy the destination predicate');
  } else {
    const endpoint = array.pop();
    console.assert(array[0] === source, 'Path failed to begin at the source');
    console.assert(destinationPredicate(endpoint), 'Endpoint failed to satisfy the destination predicate');
    console.assert(!array.every(destinationPredicate), 'Non-endpoint vertices satisfy destination predicate');
    array.push(endpoint);
    if (graph.adjacencyMatrix !== undefined) {
      console.assert(array.every((value, index) => graph.adjacencyMatrix[index][index + 1] !== undefined || array.length <= index + 1), 'Adjacent vertices do not correspond to edges');
    }
  }

  return array.concat();

*/
}
