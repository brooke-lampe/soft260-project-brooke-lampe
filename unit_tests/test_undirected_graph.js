QUnit.module('undirected_graph.js');
/* globals QUnit UndirectedEdge UndirectedGraph shortestUndirectedPath */
/* eslint-disable no-magic-numbers */

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
  graph.addEdge('a', new UndirectedEdge(8), 'c');
  assert.deepEqual(shortestUndirectedPath(graph, 'a', (vertex) => vertex === 'c'), ['a', 'c']);
});

QUnit.test('find a path from a vertex to a neighbor with a shortcut available', (assert) => {
  const graph = new UndirectedGraph();
  graph.addVertex('a');
  graph.addVertex('b');
  graph.addVertex('c');
  graph.addEdge('a', new UndirectedEdge(2), 'b');
  graph.addEdge('b', new UndirectedEdge(7), 'c');
  graph.addEdge('a', new UndirectedEdge(10), 'c');
  // the search should find the shortest path in terms of number of vertices, not total weighted length
  assert.deepEqual(shortestUndirectedPath(graph, 'a', (vertex) => vertex === 'c'), ['a', 'c']);
});

QUnit.test('find a nonexistent path', (assert) => {
  const graph = new UndirectedGraph();
  graph.addVertex('a');
  graph.addVertex('b');
  graph.addVertex('c');
  graph.addEdge('b', new UndirectedEdge(7), 'c');
  assert.deepEqual(shortestUndirectedPath(graph, 'a', (vertex) => vertex === 'c'), undefined);
});
