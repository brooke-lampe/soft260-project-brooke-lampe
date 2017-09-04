QUnit.module('loading.js');
/* globals QUnit dataToGraphs WALK_SPEED DRIVE_SPEED */
/* eslint-disable no-magic-numbers */

function vertices(...data) {
  console.assert(data.length % 3 === 0, `Tried to create test data with incomplete vertex-description triples: ${data}.`);
  const result = [];
  for (let i = 0; i < data.length; i += 3) {
    result.push({
      name: data[i],
      position: [data[i + 1], data[i + 2]],
    });
  }
  return result;
}

function edges(...data) {
  console.assert(data.length % 4 === 0, `Tried to create test data with incomplete edge-description quadruples: ${data}.`);
  const result = [];
  for (let i = 0; i < data.length; i += 4) {
    result.push({
      source: data[i],
      destination: data[i + 1],
      path: data[i + 2],
      length: data[i + 3],
    });
  }
  return result;
}

QUnit.test('load vertex names', (assert) => {
  const {
    walkGraph,
    driveGraph,
  } = dataToGraphs({
    vertices: vertices('a', 0, 0, 'b', 1, -1, 'c', 1, 1),
    edges: [],
  });
  assert.deepEqual(walkGraph.vertices.map((vertex) => vertex.name).sort(), ['a', 'b', 'c']);
  assert.deepEqual(driveGraph.vertices.map((vertex) => vertex.name).sort(), ['a', 'b', 'c']);
});

QUnit.test('load vertex positions', (assert) => {
  const {
    walkGraph,
    driveGraph,
  } = dataToGraphs({
    vertices: vertices('a', 0, 0, 'b', 1, -1, 'c', 1, 1),
    edges: [],
  });
  assert.deepEqual(walkGraph.vertices.map((vertex) => `${vertex.position}`).sort(), ['0,0', '1,-1', '1,1']);
  assert.deepEqual(driveGraph.vertices.map((vertex) => `${vertex.position}`).sort(), ['0,0', '1,-1', '1,1']);
});

QUnit.test('load neighborhoods', (assert) => {
  const {
    walkGraph,
    driveGraph,
  } = dataToGraphs({
    vertices: vertices('a', 0, 0, 'b', 1, -1, 'c', 1, 1),
    edges: edges('a', 'b', [[0, 0], [1, -1]], 2),
  });
  assert.deepEqual(walkGraph.getNeighbors(walkGraph.vertices[0]).map((vertex) => vertex.name).sort(), ['b']);
  assert.deepEqual(walkGraph.getNeighbors(walkGraph.vertices[1]).map((vertex) => vertex.name).sort(), ['a']);
  assert.deepEqual(walkGraph.getNeighbors(walkGraph.vertices[2]).map((vertex) => vertex.name).sort(), []);
  assert.deepEqual(driveGraph.getNeighbors(driveGraph.vertices[0]).map((vertex) => vertex.name).sort(), ['b']);
  assert.deepEqual(driveGraph.getNeighbors(driveGraph.vertices[1]).map((vertex) => vertex.name).sort(), ['a']);
  assert.deepEqual(driveGraph.getNeighbors(driveGraph.vertices[2]).map((vertex) => vertex.name).sort(), []);
});

QUnit.test('load short paths', (assert) => {
  const {
    walkGraph,
    driveGraph,
  } = dataToGraphs({
    vertices: vertices('a', 0, 0, 'b', 1, -1, 'c', 1, 1),
    edges: edges('a', 'b', [[0, 0], [1, -1]], 2),
  });
  assert.deepEqual(walkGraph.getEdge(walkGraph.vertices[0], walkGraph.vertices[1]).path, [[0, 0], [1, -1]]);
  assert.deepEqual(driveGraph.getEdge(driveGraph.vertices[0], driveGraph.vertices[1]).path, [[0, 0], [1, -1]]);
});

QUnit.test('load long paths', (assert) => {
  const {
    walkGraph,
    driveGraph,
  } = dataToGraphs({
    vertices: vertices('a', 0, 0, 'b', 1, -1, 'c', 1, 1),
    edges: edges('a', 'b', [[0, 0], [0.5, 0], [1, -1]], 2),
  });
  assert.deepEqual(walkGraph.getEdge(walkGraph.vertices[0], walkGraph.vertices[1]).path, [[0, 0], [0.5, 0], [1, -1]]);
  assert.deepEqual(driveGraph.getEdge(driveGraph.vertices[0], driveGraph.vertices[1]).path, [[0, 0], [0.5, 0], [1, -1]]);
});

QUnit.test('load lengths', (assert) => {
  const {
    walkGraph,
    driveGraph,
  } = dataToGraphs({
    vertices: vertices('a', 0, 0, 'b', 1, -1, 'c', 1, 1),
    edges: edges('a', 'b', [[0, 0], [1, -1]], 2),
  });
  assert.deepEqual(walkGraph.getEdge(walkGraph.vertices[0], walkGraph.vertices[1]).weight, 2 / WALK_SPEED);
  assert.deepEqual(driveGraph.getEdge(driveGraph.vertices[0], driveGraph.vertices[1]).weight, 2 / DRIVE_SPEED);
});
