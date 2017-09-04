/* exported Patch */
/* globals shortestUndirectedPath */

class InducedGraph {
  constructor(graph, predicate) {
    this.graph = graph;
    this.predicate = predicate;
  }

  getNeighbors(vertex) {
    return this.graph.getNeighbors(vertex).filter(this.predicate);
  }

  getEdge(source, destination) {
    return this.predicate(source) && this.predicate(destination) ? this.graph.getEdge(source, destination) : undefined;
  }
}

class Patch {
  constructor(graph, route) {
    this.graph = graph;
    this.route = route;
    this.vertices = [];
  }

  clear() {
    this.vertices = [];
  }

  get complete() {
    if (this.vertices.length < 2) {
      return false;
    }
    if (this.route !== undefined) {
      return this.route.hasInCore(this.vertices.top());
    }
    return this.vertices[0] === this.vertices.top();
  }

  editBy(vertex) {
    if (this.vertices.length === 0) {
      if (this.route === undefined || this.route.hasInCore(vertex)) {
        this.vertices = [vertex];
      }
    } else {
      const index = this.vertices.indexOf(vertex);
      if (index < 0 || this.route === undefined && index === 0 && this.vertices.length > 1) {
        const source = this.vertices.top();
        const induced = new InducedGraph(this.graph, (otherVertex) =>
          otherVertex === source || otherVertex === vertex ||
          !(this.route !== undefined && this.route.hasInCore(otherVertex) || this.vertices.includes(otherVertex)));
        const path = shortestUndirectedPath(induced, source, (otherVertex) => otherVertex === vertex);
        if (path !== undefined) {
          this.vertices.push(...path.slice(1));
        }
      } else if (index === 0) {
        this.vertices = [];
      } else {
        this.vertices.splice(index + 1, Infinity);
      }
    }
  }
}
