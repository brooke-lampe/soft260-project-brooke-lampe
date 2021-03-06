QUnit.module('undirected_graph.js');
/* globals QUnit UndirectedEdge UndirectedGraph shortestUndirectedPath */
/* eslint-disable no-magic-numbers */

function projection(vertex) {
  let value = vertex;

  if (vertex === 'b') {
    value = 'a';
  }

  if (vertex === 'd') {
    value = 'c';
  }

  return value;
}

QUnit.test('find the nonexistent neighbors of a vertex', (assert) => {
  const graph = new UndirectedGraph();
  graph.addVertex('a');
  graph.addVertex('b');
  graph.addVertex('c');
  graph.addEdge('b', new UndirectedEdge(7), 'c');
  assert.deepEqual(graph.getNeighbors('a').sort(), []);
});

QUnit.test('find the neighbors of a vertex', (assert) => {
  const graph = new UndirectedGraph();
  graph.addVertex('a');
  graph.addVertex('b');
  graph.addVertex('c');
  graph.addEdge('a', new UndirectedEdge(2), 'b');
  graph.addEdge('b', new UndirectedEdge(7), 'c');
  graph.addEdge('a', new UndirectedEdge(8), 'c');
  assert.deepEqual(graph.getNeighbors('a').sort(), ['b', 'c']);
});

QUnit.test('retrieve a nonexistent self edge', (assert) => {
  const graph = new UndirectedGraph();
  graph.addVertex('a');
  graph.addVertex('b');
  graph.addVertex('c');
  graph.addEdge('a', new UndirectedEdge(2), 'a');
  graph.addEdge('b', new UndirectedEdge(7), 'c');
  graph.addEdge('a', new UndirectedEdge(8), 'c');
  assert.deepEqual(graph.getEdge('a', 'a'), undefined);
});

QUnit.test('retrieve a nonexistent edge given two vertices', (assert) => {
  const graph = new UndirectedGraph();
  graph.addVertex('a');
  graph.addVertex('b');
  graph.addVertex('c');
  graph.addEdge('b', new UndirectedEdge(7), 'c');
  graph.addEdge('a', new UndirectedEdge(8), 'c');
  assert.deepEqual(graph.getEdge('a', 'b'), undefined);
  assert.deepEqual(graph.getEdge('b', 'a'), undefined);
});

QUnit.test('retrieve an edge given two vertices', (assert) => {
  const graph = new UndirectedGraph();
  graph.addVertex('a');
  graph.addVertex('b');
  graph.addVertex('c');
  const edge = new UndirectedEdge(2);
  graph.addEdge('a', edge, 'b');
  graph.addEdge('b', new UndirectedEdge(7), 'c');
  graph.addEdge('a', new UndirectedEdge(8), 'c');
  assert.deepEqual(graph.getEdge('a', 'b'), edge);
  assert.deepEqual(graph.getEdge('b', 'a'), edge);
});

QUnit.test('find a path from a vertex to itself', (assert) => {
  const graph = new UndirectedGraph();
  graph.addVertex('a');
  graph.addVertex('b');
  graph.addVertex('c');
  graph.addEdge('a', new UndirectedEdge(2), 'b');
  graph.addEdge('b', new UndirectedEdge(7), 'c');
  graph.addEdge('a', new UndirectedEdge(8), 'c');
  assert.deepEqual(shortestUndirectedPath(graph, 'a', (vertex) => vertex === 'a'), ['a']);
});

QUnit.test('find a path from a vertex to a neighbor with no shortcuts available', (assert) => {
  const graph = new UndirectedGraph();
  graph.addVertex('a');
  graph.addVertex('b');
  graph.addVertex('c');
  graph.addEdge('a', new UndirectedEdge(2), 'b');
  graph.addEdge('b', new UndirectedEdge(7), 'c');
  graph.addEdge('c', new UndirectedEdge(8), 'a');
  assert.deepEqual(shortestUndirectedPath(graph, 'a', (vertex) => vertex === 'c'), ['a', 'c']);
});

QUnit.test('find a path from a vertex to a neighbor with a shortcut available', (assert) => {
  const graph = new UndirectedGraph();
  graph.addVertex('a');
  graph.addVertex('b');
  graph.addVertex('c');
  graph.addEdge('a', new UndirectedEdge(2), 'b');
  graph.addEdge('b', new UndirectedEdge(7), 'c');
  graph.addEdge('c', new UndirectedEdge(10), 'a');
  assert.deepEqual(shortestUndirectedPath(graph, 'a', (vertex) => vertex === 'c'), ['a', 'b', 'c']);
});

QUnit.test('find a nonexistent path', (assert) => {
  const graph = new UndirectedGraph();
  graph.addVertex('a');
  graph.addVertex('b');
  graph.addVertex('c');
  graph.addEdge('b', new UndirectedEdge(7), 'c');
  assert.deepEqual(shortestUndirectedPath(graph, 'a', (vertex) => vertex === 'c'), undefined);
});

QUnit.test('find the shortest path from a vertex to a neighbor without a direct path', (assert) => {
  const graph = new UndirectedGraph();
  graph.addVertex('a');
  graph.addVertex('b');
  graph.addVertex('c');
  graph.addVertex('d');
  graph.addVertex('e');
  graph.addEdge('a', new UndirectedEdge(5), 'b');
  graph.addEdge('b', new UndirectedEdge(5), 'c');
  graph.addEdge('c', new UndirectedEdge(5), 'd');
  graph.addEdge('d', new UndirectedEdge(5), 'a');
  graph.addEdge('b', new UndirectedEdge(5), 'e');
  graph.addEdge('c', new UndirectedEdge(5), 'e');
  assert.deepEqual(shortestUndirectedPath(graph, 'a', (vertex) => vertex === 'e'), ['a', 'b', 'e']);
});

QUnit.test('find the shortest path from a vertex to a neighbor in a complex graph', (assert) => {
  const graph = new UndirectedGraph();
  graph.addVertex('a');
  graph.addVertex('b');
  graph.addVertex('c');
  graph.addVertex('d');
  graph.addVertex('e');
  graph.addVertex('f');
  graph.addEdge('a', new UndirectedEdge(4), 'b');
  graph.addEdge('b', new UndirectedEdge(3), 'c');
  graph.addEdge('c', new UndirectedEdge(4), 'd');
  graph.addEdge('d', new UndirectedEdge(3), 'a');
  graph.addEdge('d', new UndirectedEdge(5), 'b');
  graph.addEdge('b', new UndirectedEdge(5), 'e');
  graph.addEdge('c', new UndirectedEdge(5), 'e');
  graph.addEdge('e', new UndirectedEdge(5), 'f');
  assert.deepEqual(shortestUndirectedPath(graph, 'a', (vertex) => vertex === 'f'), ['a', 'b', 'e', 'f']);
});

QUnit.test('find the shortest path from a vertex to a neighbor in a complex graph (2)', (assert) => {
  const graph = new UndirectedGraph();
  graph.addVertex('a');
  graph.addVertex('b');
  graph.addVertex('c');
  graph.addVertex('d');
  graph.addVertex('e');
  graph.addVertex('f');
  graph.addEdge('a', new UndirectedEdge(4), 'b');
  graph.addEdge('b', new UndirectedEdge(4), 'c');
  graph.addEdge('c', new UndirectedEdge(1), 'd');
  graph.addEdge('d', new UndirectedEdge(1), 'a');
  graph.addEdge('d', new UndirectedEdge(6), 'b');
  graph.addEdge('b', new UndirectedEdge(5), 'e');
  graph.addEdge('c', new UndirectedEdge(5), 'e');
  graph.addEdge('e', new UndirectedEdge(5), 'f');
  assert.deepEqual(shortestUndirectedPath(graph, 'a', (vertex) => vertex === 'f'), ['a', 'd', 'c', 'e', 'f']);
});

QUnit.test('find the shortest path from a vertex to a neighbor in a square', (assert) => {
  const graph = new UndirectedGraph();
  graph.addVertex('a');
  graph.addVertex('b');
  graph.addVertex('c');
  graph.addVertex('d');
  graph.addEdge('a', new UndirectedEdge(5), 'b');
  graph.addEdge('b', new UndirectedEdge(5), 'c');
  graph.addEdge('c', new UndirectedEdge(5), 'd');
  graph.addEdge('d', new UndirectedEdge(5), 'a');
  assert.deepEqual(shortestUndirectedPath(graph, 'a', (vertex) => vertex === 'b'), ['a', 'b']);
});

QUnit.test('find the shortest path from a vertex to a neighbor in a trapezoid', (assert) => {
  const graph = new UndirectedGraph();
  graph.addVertex('a');
  graph.addVertex('b');
  graph.addVertex('c');
  graph.addVertex('d');
  graph.addEdge('a', new UndirectedEdge(10), 'b');
  graph.addEdge('b', new UndirectedEdge(1), 'c');
  graph.addEdge('c', new UndirectedEdge(1), 'd');
  graph.addEdge('d', new UndirectedEdge(1), 'a');
  assert.deepEqual(shortestUndirectedPath(graph, 'a', (vertex) => vertex === 'b'), ['a', 'd', 'c', 'b']);
});

QUnit.test('find the shortest path from a vertex to a neighbor in a rectangle with diagonals', (assert) => {
  const graph = new UndirectedGraph();
  graph.addVertex('a');
  graph.addVertex('b');
  graph.addVertex('c');
  graph.addVertex('d');
  graph.addEdge('a', new UndirectedEdge(4), 'b');
  graph.addEdge('b', new UndirectedEdge(3), 'c');
  graph.addEdge('c', new UndirectedEdge(4), 'd');
  graph.addEdge('d', new UndirectedEdge(3), 'a');
  graph.addEdge('a', new UndirectedEdge(5), 'c');
  graph.addEdge('b', new UndirectedEdge(5), 'd');
  assert.deepEqual(shortestUndirectedPath(graph, 'a', (vertex) => vertex === 'c'), ['a', 'c']);
});

QUnit.test('find the shortest path in a triangle while exercising projection parameter', (assert) => {
  const graph = new UndirectedGraph();
  graph.addVertex('a');
  graph.addVertex('b');
  graph.addVertex('c');
  graph.addEdge('a', new UndirectedEdge(5), 'b');
  graph.addEdge('b', new UndirectedEdge(5), 'c');
  graph.addEdge('c', new UndirectedEdge(5), 'a');
  assert.deepEqual(shortestUndirectedPath(graph, 'a', (vertex) => vertex === 'c', projection), ['a', 'c']);
});

QUnit.test('find the shortest path in a diamond while exercising the projection parameter', (assert) => {
  const graph = new UndirectedGraph();
  graph.addVertex('a');
  graph.addVertex('b');
  graph.addVertex('c');
  graph.addVertex('d');
  graph.addEdge('a', new UndirectedEdge(5), 'b');
  graph.addEdge('b', new UndirectedEdge(5), 'c');
  graph.addEdge('c', new UndirectedEdge(5), 'd');
  graph.addEdge('d', new UndirectedEdge(5), 'a');
  graph.addEdge('b', new UndirectedEdge(5), 'd');
  assert.deepEqual(shortestUndirectedPath(graph, 'a', (vertex) => vertex === 'd', projection), ['a', 'd']);
});

QUnit.test('find the shortest path as determined by the projection parameter', (assert) => {
  const graph = new UndirectedGraph();
  graph.addVertex('a');
  graph.addVertex('b');
  graph.addVertex('c');
  graph.addVertex('e');
  graph.addEdge('a', new UndirectedEdge(5), 'b');
  graph.addEdge('b', new UndirectedEdge(5), 'c');
  graph.addEdge('c', new UndirectedEdge(5), 'e');
  graph.addEdge('e', new UndirectedEdge(5), 'a');
  graph.addEdge('b', new UndirectedEdge(5), 'e');
  assert.deepEqual(shortestUndirectedPath(graph, 'a', (vertex) => vertex === 'c', projection), ['a', 'e', 'c']);
});
