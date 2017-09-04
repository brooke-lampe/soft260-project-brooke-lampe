/* exported loadGraphs */
/* globals PositionedVertex PositionedEdge UndirectedGraph */

const WALK_SPEED = 5;
const DRIVE_SPEED = 15;

function dataToGraphs(data) {
  const verticesByName = new Map();
  const walkGraph = new UndirectedGraph();
  const driveGraph = new UndirectedGraph();
  for (const description of data.vertices) {
    const vertex = new PositionedVertex(description.name, description.position);
    verticesByName.set(description.name, vertex);
    walkGraph.addVertex(vertex);
    driveGraph.addVertex(vertex);
  }
  for (const description of data.edges) {
    const source = verticesByName.get(description.source);
    const destination = verticesByName.get(description.destination);
    if (walkGraph.getEdge(source, destination) === undefined) {
      const edge = new PositionedEdge(source, description.path, description.length / WALK_SPEED, destination);
      walkGraph.addEdge(source, edge, destination);
    }
    if (driveGraph.getEdge(source, destination) === undefined) {
      const edge = new PositionedEdge(source, description.path, description.length / DRIVE_SPEED, destination);
      driveGraph.addEdge(source, edge, destination);
    }
  }
  return {
    walkGraph,
    driveGraph,
  };
}

function loadGraphs(address, radius, success, error) {
  $.ajax({
    async: false,
    url: 'server/city.cgi',
    data: {
      address,
      radius,
    },
    dataType: 'json',
    success: (data) => {
      success(dataToGraphs(data));
    },
    error,
  });
}
