/* globals transitVisualizationDefaultOptions Placement ThrottledSimulation */

const PRIMARY_BUTTON = 1;

function sanitizeAttributeValue(attributeValue) {
  return String(attributeValue).replace(/(\W)/g, (character) => `-${character.codePointAt(0)}`);
}

class Subwidget {
  constructor(owner, entity, options = undefined) {
    this._owner = owner;
    this._entity = entity;
    this._element = owner.svg.group(options);
    this._highlight = owner.svg.group(this.element, {opacity: 0.0});
    this.clickable = false;
    $(this._element).on('click', (event) => {
      if (event.which === PRIMARY_BUTTON) {
        event.entity = entity;
        owner._trigger('interact', event); // eslint-disable-line no-underscore-dangle
      }
    });
    $(this._element).on('mouseenter mouseleave', (event) => {
      event.entity = entity;
      owner._trigger('interact', event); // eslint-disable-line no-underscore-dangle
    });
  }

  destroy() {
    $(this._element).remove();
    this._element = undefined;
    this._highlight = undefined;
  }

  get destroyed() {
    return this._element === undefined;
  }

  get slowness() {
    return this._owner.throttledSimulation.slowness;
  }

  get element() {
    return this._element;
  }

  get highlight() {
    return this._highlight;
  }

  get highlighted() {
    return this._highlight.getAttribute('opacity') > 0;
  }

  set highlighted(highlighted) {
    return this._highlight.setAttribute('opacity', highlighted ? 1.0 : 0.0);
  }

  get clickable() {
    return $(this._element).css('pointer-events') !== 'none';
  }

  set clickable(clickable) {
    $(this._element).css('pointer-events', clickable ? 'auto' : 'none');
  }
}

class VertexDot extends Subwidget {
  constructor(owner, vertex) {
    super(owner, vertex, {
      class: 'vertex',
      id: sanitizeAttributeValue(vertex.name),
      transform: String(new Placement(vertex.position, 0)),
    });
    owner.svg.circle(this.element, 0, 0, owner.option('vertexRadius'), owner.option('vertexStyle'));
    owner.svg.circle(this.highlight, 0, 0, owner.option('vertexRadius') + owner.option('selectorPadding'), owner.option('fillSelectorStyle'));
  }
}

class EdgePavement extends Subwidget {
  constructor(owner, edge) {
    super(owner, edge, {class: 'edge'});
    owner.svg.polyline(this.element, edge.path, owner.option('edgePavementStyle'));
    owner.svg.polyline(this.element, edge.path, owner.option('edgeStripeStyle'));
    owner.svg.polyline(this.highlight, edge.path, Object.assign({}, owner.option('strokeSelectorStyle'),
      {strokeWidth: owner.option('edgePavementStyle').strokeWidth + owner.option('selectorPadding')}));
  }
}

class RouteTrace extends Subwidget {
  constructor(owner, route) {
    super(owner, route, {class: 'route'});
    const styles = owner.option('routeStyles');
    const index = route.city.routes.indexOf(route);
    this._activeStyle = Object.assign({}, owner.option('routeStripeStyle'), styles[index % styles.length].stripe);
    this._moribundStyle = Object.assign({}, owner.option('routeStripeStyle'), owner.option('retiredStyle').stripe);
    this._highlightStyle = Object.assign({}, owner.option('strokeSelectorStyle'), styles[index % styles.length].stripe,
      {strokeWidth: owner.option('routeStripeStyle').strokeWidth + owner.option('selectorPadding')});
    this.refresh();
  }

  refresh() {
    $(this.element).children().not(this.highlight).remove();
    $(this.highlight).empty();
    const style = this._entity.moribund ? this._moribundStyle : this._activeStyle;
    for (const arc of this._entity.arcs) {
      this._owner.svg.polyline(this.element, arc.edge.path, style);
      this._owner.svg.polyline(this.highlight, arc.edge.path, this._highlightStyle);
    }
  }
}

class PatchTrace extends Subwidget {
  constructor(owner, patch, isPreview) {
    super(owner, patch, {class: 'patch'});
    this._style = Object.assign({}, owner.option('routeStripeStyle'), isPreview ? owner.option('patchPreviewStyle') : owner.option('patchStyle'));
    this.refresh();
  }

  set clickable(clickable) {
    console.assert(!clickable, `Attempted to set the clickability of the patch trace ${this}, which is always unclickable, to true.`);
    super.clickable = clickable;
  }

  refresh() {
    $(this.element).empty();
    const vertices = this._entity.vertices;
    for (let i = 0; i < vertices.length - 1; ++i) {
      const edge = this._entity.graph.getEdge(vertices[i], vertices[i + 1]);
      this._owner.svg.polyline(this.element, edge.path, this._style);
    }
    if (vertices.length > 0) {
      const vertex = vertices.top();
      this._owner.svg.circle(this.element, ...vertex.position, this._owner.option('vertexRadius') + this._owner.option('selectorPadding'), this._style);
    }
  }
}

class BusBox extends Subwidget {
  constructor(owner, bus) {
    super(owner, bus, {
      class: 'bus',
      transform: String(new Placement(bus.arc.originalSource.vertex.position, 0)),
    });
    const styles = owner.option('routeStyles');
    const index = bus.arc.route.city.routes.indexOf(bus.arc.route);
    this._activeStyle = Object.assign({}, owner.option('busStyle'), styles[index % styles.length].bus);
    this._moribundStyle = Object.assign({}, owner.option('busStyle'), owner.option('retiredStyle').bus);
    let width = owner.option('busWidth');
    let length = owner.option('busLength');
    let rounding = owner.option('busRounding');
    owner.svg.rect(this.element, -length / 2, -width / 2, length, width, rounding, rounding, bus.stopping ? this._moribundStyle : this._activeStyle);
    for (let i = 0; i < bus.capacity; ++i) {
      const x = length / 2 - length * (Math.floor(i / 2) + 0.5) / Math.ceil(bus.capacity / 2);
      const y = i === bus.capacity - 1 && bus.capacity % 2 === 1 ? 0 : i % 2 === 0 ? -width / 2 / 2 : width / 2 / 2;
      owner.svg.circle(this.element, x, y, owner.option('riderRadius'), owner.option('passengerStyle'));
    }
    width += 2 * owner.option('selectorPadding');
    length += 2 * owner.option('selectorPadding');
    rounding += owner.option('selectorPadding');
    owner.svg.rect(this.highlight, -length / 2, -width / 2, length, width, rounding, rounding, owner.option('fillSelectorStyle'));
    this.refresh();
  }

  refresh() {
    $(this.element).stop(true);
    const edge = this._entity.arc.edge;
    if (this._entity.progress !== undefined) { // moving
      const offset = this._owner.option('busOffset');
      const placements = edge.getTrack(offset, offset).getPlacements(this._entity.progress);
      for (let i = 0; i < placements.length; ++i) {
        const delay = i === 0 ? 0 : (placements[i].progress - placements[i - 1].progress) * this._entity.transitDelay * this.slowness;
        if (Number.isFinite(delay)) {
          $(this.element).animate({svgTransform: String(placements[i])}, delay, 'linear');
        }
      }
    }
    this._owner.svg.change($(this.element).children('rect')[0], this._entity.stopping ? this._moribundStyle : this._activeStyle);
    $(this.element).children('circle').each((index, element) => {
      const passenger = this._entity.boardingIndex === index ? this._entity.boardingPassenger : this._entity.passengers[index];
      const targetOpacity = passenger !== undefined && !passenger.alighting ? 1.0 : 0.0;
      const delay = (passenger !== undefined ? passenger.alighting ? passenger.alightingETA : passenger.boardingETA : 0) * this.slowness;
      if (Number.isFinite(delay)) {
        $(element).stop(true).animate({svgOpacity: targetOpacity}, delay, 'linear');
      }
    });
  }
}

class PassengerDot extends Subwidget {
  constructor(owner, passenger) {
    super(owner, passenger, {
      class: 'passenger',
      transform: String(new Placement(passenger.vertex.position, 0)),
    });
    owner.svg.circle(this.element, 0, 0, owner.option('passengerRadius'), owner.option('passengerStyle'));
    owner.svg.circle(this.highlight, 0, 0, owner.option('passengerRadius') + owner.option('selectorPadding'), owner.option('fillSelectorStyle'));
  }

  _getWaitingPassengerPosition(vertex, index) {
    let [x, y] = vertex.position;
    const vertexRadius = this._owner.option('vertexRadius');
    const passengerRadius = this._owner.option('passengerRadius');
    const rows = Math.max(Math.floor(vertexRadius / passengerRadius / 2), 1);
    x += vertexRadius + 2 * passengerRadius + Math.floor(index / rows) * 2 * passengerRadius;
    y += -vertexRadius + ((index % rows) * 2 + 1) * vertexRadius / rows;
    return [x, y];
  }

  refresh() {
    $(this.element).stop(true);
    if (this._entity.walkingSource !== undefined) { // walking
      $(this.element).animate({svgOpacity: 1.0}, 0);
      const edge = this._entity.simulation.walkGraph.getEdge(this._entity.walkingSource, this._entity.immediateDestination);
      console.assert(edge !== undefined,
        `Found passenger walking from ${this._entity.walkingSource} to ${this._entity.immediateDestination}, but there is no such edge.`);
      const offset = this._owner.option('passengerOffset');
      const placements = edge.getTrack(offset, offset).getPlacements(this._entity.progress);
      for (let i = 0; i < placements.length; ++i) {
        const delay = i === 0 ? 0 : (placements[i].progress - placements[i - 1].progress) * this._entity.transitDelay * this.slowness;
        if (Number.isFinite(delay)) {
          $(this.element).animate({svgTransform: String(placements[i])}, delay, 'linear');
        }
      }
    } else if (this._entity.boarding) { // boarding
      $(this.element).animate({
        svgOpacity: 0.0,
        svgTransform: String(new Placement(this._entity.vertex.position, 0)),
      }, this._entity.boardingETA * this.slowness);
    } else if (this._entity.alighting) { // alighting
      const position = this._getWaitingPassengerPosition(this._entity.immediateDestination, this._entity.immediateDestination.passengers.length);
      $(this.element).animate({
        svgOpacity: 1.0,
        svgTransform: String(new Placement(position, 0)),
      }, this._entity.alightingETA * this.slowness);
    } else if (this._entity.bus !== undefined) { // riding
      $(this.element).animate({
        svgOpacity: 0.0,
        svgTransform: String(new Placement(this._entity.immediateDestination.position, 0)),
      }, 0);
    } else if (this._entity.destination !== undefined) { // waiting
      if (this._entity.vertex !== undefined) { // waiting for bus
        const position = this._getWaitingPassengerPosition(this._entity.vertex, this._entity.vertex.passengers.indexOf(this._entity));
        $(this.element).animate({svgTransform: String(new Placement(position, 0))}, 0);
      } else { // waiting for errand
        $(this.element).animate({svgTransform: String(new Placement(this._entity.destination.position, 0))}, 0);
      }
    } else {
      console.assert(false, `Passenger ${this._entity} cannot be classified as walking, riding, or waiting, and so cannot be animated.`);
    }
  }
}

$.widget('transit.visualization', {
  options: transitVisualizationDefaultOptions,

  _create() {
    this.backgroundClickable = false;
    this.element.svg({
      settings: {preserveAspectRatio: 'xMidYMid meet'}, // zoom to fit
      onLoad: (svg) => {
        this.svg = svg;
        this.root = $(svg.root());
        this.root.on('dragstart', () => false);
        this.root.on('mousedown mousemove mouseup', (event) => this.onMouse(event));
        this.root.on('wheel', (event) => this.onWheel(event));
        this.root.on('click', (event) => this.onClick(event));
        this._populate();
        this._trigger('ready');
      },
    });
    //  this will also work
    //  this.overlay = $('<div class="overlay"><h1>Passengers with the Longest Journeys</h1><ul><li></li><li></li><li></li><li></li><li></li></ul></div>').appendTo(this.element);
    this.overlay = $('<div></div>', {class: 'overlay'}).appendTo(this.element);
    this.heading = $('<h2></h2>', {text: this.option('headingText')}).appendTo(this.overlay);
    this.unordered = $('<ul></ul>').appendTo(this.overlay);
  },

  _populate() {
    this._city = this.option('city');
    console.assert(this._city !== undefined, 'Visualization created without any associated city.');
    this._passengers = this.option('passengers');
    console.assert(this._passengers !== undefined, 'Visualization created without any associated passenger list.');

    const minimumX = Math.min(...this._city.walkGraph.vertices.map((vertex) => vertex.position[0])) - this.option('worldPadding');
    const maximumX = Math.max(...this._city.walkGraph.vertices.map((vertex) => vertex.position[0])) + this.option('worldPadding');
    const minimumY = Math.min(...this._city.walkGraph.vertices.map((vertex) => vertex.position[1])) - this.option('worldPadding');
    const maximumY = Math.max(...this._city.walkGraph.vertices.map((vertex) => vertex.position[1])) + this.option('worldPadding');
    this.svg.configure({viewBox: `${minimumX} ${minimumY} ${maximumX - minimumX} ${maximumY - minimumY}`});

    this._edgePavements = new Map();
    for (const edge of this._city.walkGraph.edges) {
      this._edgePavements.set(edge, new EdgePavement(this, edge));
    }
    this._vertexDots = new Map();
    for (const vertex of this._city.walkGraph.vertices) {
      this._vertexDots.set(vertex, new VertexDot(this, vertex));
    }
    this._patchTrace = undefined;
    this._patchPreviewTrace = undefined;
    this._routeTraces = new Map();
    this._busBoxes = new Map();
    for (const route of this._city.routes) {
      if (route !== undefined) {
        this._routeTraces.set(route, new RouteTrace(this, route));
        for (const bus of route.buses) {
          if (bus !== undefined) {
            this._busBoxes.set(bus, new BusBox(this, bus));
          }
        }
      }
    }
    this._passengerDots = new Map();
    for (const passenger of this._passengers) {
      this._passengerDots.set(passenger, new PassengerDot(this, passenger));
    }
    this._selection = undefined;

    this.throttledSimulation = new ThrottledSimulation(this._city, () => this._refresh());
  },

  _refresh() {
    if (this._patchTrace !== undefined) {
      this._patchTrace.refresh();
    }
    if (this._patchPreviewTrace !== undefined) {
      this._patchPreviewTrace.refresh();
    }
    const moribundRoutes = new Set(this._routeTraces.keys());
    const moribundBuses = new Set(this._busBoxes.keys());
    for (const route of this._city.routes) {
      if (route !== undefined) {
        const trace = this._routeTraces.get(route);
        if (trace !== undefined) {
          trace.refresh();
        } else {
          this._routeTraces.set(route, new RouteTrace(this, route));
        }
        moribundRoutes.delete(route);
        for (const bus of route.buses) {
          const box = this._busBoxes.get(bus);
          if (box !== undefined) {
            box.refresh();
          } else {
            this._busBoxes.set(bus, new BusBox(this, bus));
          }
          moribundBuses.delete(bus);
        }
      }
    }
    for (const route of moribundRoutes) {
      this._routeTraces.get(route).destroy();
      this._routeTraces.delete(route);
    }
    for (const bus of moribundBuses) {
      this._busBoxes.get(bus).destroy();
      this._busBoxes.delete(bus);
    }
    for (const dot of this._passengerDots.values()) {
      dot.refresh();
    }

    this.overlay.find('ul').empty();

    const count = 5;
    const L = this._city.findTopKDuration(count);

    for (let i = 0; i < L.length; i++) {
      $('<li></li>', {text: 'Passenger '.concat(L[i].name).concat(' (LENGTH = ').concat(L[i].duration).concat(')')}).appendTo(this.unordered);
    }
    //  Will show current time
    //  $('<li></li>', {text: this._city.currentTime}).appendTo(this.unordered);
  },

  getSlowness() {
    return this.throttledSimulation.slowness;
  },

  setSlowness(slowness) {
    this.throttledSimulation.slowness = slowness;
  },

  setClickability(clickability) {
    this.backgroundClickable = clickability.background;
    for (const dot of this._vertexDots.values()) {
      dot.clickable = clickability.vertices;
    }
    for (const pavement of this._edgePavements.values()) {
      pavement.clickable = clickability.edges;
    }
    for (const trace of this._routeTraces.values()) {
      trace.clickable = clickability.routes;
    }
    for (const box of this._busBoxes.values()) {
      box.clickable = clickability.buses;
    }
    for (const dot of this._passengerDots.values()) {
      dot.clickable = clickability.passengers;
    }
  },

  setPatch(patch, preview) {
    if (this._patchTrace !== undefined) {
      this._patchTrace.destroy();
    }
    if (this._patchPreviewTrace !== undefined) {
      this._patchPreviewTrace.destroy();
    }
    if (patch !== undefined) {
      this._patchTrace = new PatchTrace(this, patch, false);
    } else {
      this._patchTrace = undefined;
    }
    if (preview !== undefined) {
      this._patchPreviewTrace = new PatchTrace(this, preview, true);
    } else {
      this._patchPreviewTrace = undefined;
    }
    this.synchronize();
  },

  setSelection(entity) {
    if (this._selection !== undefined) {
      this._selection.highlighted = false;
    }
    this._selection = undefined;
    for (const map of [this._edgePavements, this._vertexDots, this._routeTraces, this._busBoxes, this._passengerDots]) {
      if (map.has(entity)) {
        this._selection = map.get(entity);
        break;
      }
    }
    if (this._selection !== undefined) {
      this._selection.highlighted = true;
    }
  },

  synchronize() {
    this.throttledSimulation.synchronize();
  },

  pan(dx, dy) {
    const [minimumX, minimumY, width, height] = this.root[0].getAttribute('viewBox').split(' ').map((value) => Number(value));
    const scale = Math.max(width, height);
    const newViewbox = [
      minimumX - dx * scale,
      minimumY - dy * scale,
      width,
      height,
    ];
    this.svg.configure({viewBox: newViewbox.join(' ')});
  },

  onMouse(event) {
    const position = this.root.position();
    const dragPoint = [event.pageX - position.left, event.pageY - position.top];
    if (event.type === 'mousedown') {
      if (event.buttons === PRIMARY_BUTTON) {
        this.initialDragPoint = dragPoint;
        this.previousDragPoint = dragPoint;
      }
      this.previousButtons = event.buttons;
    } else if (event.type === 'mousemove') {
      if (event.buttons === PRIMARY_BUTTON && this.previousDragPoint !== undefined) {
        const scale = 1 / Math.min(this.root.width(), this.root.height());
        this.pan((dragPoint[0] - this.previousDragPoint[0]) * scale, (dragPoint[1] - this.previousDragPoint[1]) * scale);
        this.previousDragPoint = dragPoint;
      }
    } else if (event.type === 'mouseup') {
      this.initialDragPoint = undefined;
      this.previousButtons = event.buttons;
    } else {
      this.previousDragPoint = undefined;
    }
    return false;
  },

  zoom(dz) {
    if (dz === 0) {
      return;
    }
    const [minimumX, minimumY, width, height] = this.root[0].getAttribute('viewBox').split(' ').map((value) => Number(value));
    const limit = this.option('zoomLimit');
    if ((width < limit || height < limit) && dz < 0) {
      return;
    }
    const multiplier = dz < 0 ? this.option('zoomMultiplier') : 1 / this.option('zoomMultiplier');
    const newViewbox = [
      minimumX + (1 - multiplier) * width / 2,
      minimumY + (1 - multiplier) * height / 2,
      multiplier * width,
      multiplier * height,
    ];
    this.svg.configure({viewBox: newViewbox.join(' ')});
  },

  onWheel(event) {
    this.zoom(event.originalEvent.deltaZ || event.originalEvent.deltaY);
    return false;
  },

  onClick(event) {
    if (this.backgroundClickable && event.target.nodeName.toLowerCase() === 'svg') {
      event.entity = undefined;
      this._trigger('interact', event);
    }
  },
});
