/* globals Coprogram block PositionedVertex PositionedEdge City Route Bus Passenger Patch loadGraphs AVERY_MAP dataToGraphs */

// Configuration

const LOAD_MAPS_FROM_SERVER = false;
const HARD_CODED_MAP = AVERY_MAP;
const SERVER_MAP_CENTER_ADDRESS = 'Eiffel Tower, Paris, France';
const SERVER_MAP_RADIUS = 1000; // meters
const PASSENGER_COUNT = 16;
const BUS_CAPACITY = 6;

function generatePassengerWaitTime() {
  return 1 + Math.random();
}

// Setup

let graphs = {};
if (LOAD_MAPS_FROM_SERVER) {
  loadGraphs(SERVER_MAP_CENTER_ADDRESS, SERVER_MAP_RADIUS, (loadedGraphs) => {
    graphs = loadedGraphs;
  }, console.error);
} else {
  graphs = dataToGraphs(HARD_CODED_MAP);
}

const city = new City(graphs.walkGraph, graphs.driveGraph);
const passengers = [];
for (let i = PASSENGER_COUNT; i--;) {
  const passenger = new Passenger(city, `#${i}`, generatePassengerWaitTime(), city.chooseRandomWalkVertex());
  passengers.push(passenger);
  passenger.start();
}

// Utility functions

function getArc(route, edge) {
  if (edge instanceof PositionedEdge) {
    for (const [source, destination] of [[edge.source, edge.destination], [edge.destination, edge.source]]) {
      if (route.has(source)) {
        const arc = route.getArc(source);
        if (arc !== undefined && arc.destination.vertex === destination) {
          return arc;
        }
      }
    }
  }
  return undefined;
}

function hasEdge(route, edge) {
  return getArc(route, edge) !== undefined;
}

function convertSelectionToHTML(selection) {
  if (selection === undefined) {
    return '(No selection)';
  }
  if (selection instanceof PositionedVertex) {
    return `Intersection ${selection.name}`;
  }
  if (selection instanceof PositionedEdge) {
    return `Street from ${selection.source.name} to ${selection.destination.name}`;
  }
  if (selection instanceof Route) {
    return `Route #${city.routes.indexOf(selection)}`;
  }
  if (selection instanceof Passenger) {
    return `Passenger ${selection.name}`;
  }
  if (selection instanceof Bus) {
    return `Bus on Route #${city.routes.indexOf(selection.arc.route)}`;
  }
  return 'Unknown object';
}

// UI

const visualization = $('#visualization');
const selectionControls = $('#selection');
const actionsControls = $('#actions');
const speedControls = $('#speed');

class Option {
  constructor(html, action = undefined) {
    this.html = html;
    this.action = action;
  }

  buildButton() {
    return $('<button></button>').html(this.html).data('option', this);
  }
}

function*showMenu(prompt, options) {
  actionsControls.html(prompt !== undefined ? prompt : '');
  let needSpace = prompt !== undefined;
  let buttons = $();
  for (const option of options) {
    const button = option.buildButton();
    if (needSpace) {
      actionsControls.append(' ');
    }
    actionsControls.append(button);
    buttons = buttons.add(button);
    needSpace = true;
  }
  return yield* block((unblock) => {
    buttons.on('click.showMenu', function onClick() {
      unblock($(this).data('option'));
    });
  }, () => {
    buttons.attr('disabled', 'disabled').off('click.showMenu');
  });
}

const YES = new Option('Yes');
const NO = new Option('No');
const CANCEL = new Option('Cancel');
const DONE = new Option('Done');

const ADD_ROUTE = new Option('Add Route', function*addRoute() {
  const patch = new Patch(graphs.driveGraph, undefined);
  const preview = new Patch(graphs.driveGraph, undefined);
  visualization.visualization('setClickability', {vertices: true});
  visualization.visualization('setPatch', patch, preview);
  visualization.visualization('synchronize');
  for (;;) {
    const event = yield* showMenu('Adding route…', [CANCEL]);
    if (event === CANCEL) {
      visualization.visualization('setPatch', undefined, undefined);
      visualization.visualization('synchronize');
      return undefined;
    }
    if (event.entity instanceof PositionedVertex) {
      if (event.originalEvent.type === 'click') {
        patch.editBy(event.entity);
        preview.clear();
        if (patch.complete) {
          const vertices = patch.vertices.slice(0, -1);
          const route = new Route(city, vertices[0], vertices.top());
          if (vertices.length > 2) {
            route.patch(...vertices);
          }
          visualization.visualization('setPatch', undefined, undefined);
          visualization.visualization('synchronize');
          return route;
        }
        visualization.visualization('synchronize');
      } else if (event.originalEvent.type === 'mouseenter') {
        preview.clear();
        preview.vertices = patch.vertices.concat();
        preview.editBy(event.entity);
        if (preview.vertices.length > patch.vertices.length) { // forward
          preview.vertices.splice(0, patch.vertices.length - 1);
        } else if (preview.vertices.length < patch.vertices.length) { // backward
          console.assert(preview.vertices.length >= 0, 'Tried to preview a change to a patch that would destroy the patch.');
          preview.vertices = patch.vertices.slice(preview.vertices.length - 1).reverse();
        } else { // invalid
          preview.clear();
        }
        visualization.visualization('synchronize');
      } else if (event.originalEvent.type === 'mouseleave') {
        preview.clear();
        visualization.visualization('synchronize');
      }
    }
  }
});

const CHANGE_ROUTE = new Option('Change Route', function*changeRoute(route) {
  const patch = new Patch(graphs.driveGraph, route);
  const preview = new Patch(graphs.driveGraph, route);
  visualization.visualization('setClickability', {vertices: true});
  visualization.visualization('setPatch', patch, preview);
  visualization.visualization('synchronize');
  for (;;) {
    const event = yield* showMenu('Changing route…', [DONE]);
    if (event === DONE) {
      visualization.visualization('setPatch', undefined, undefined);
      visualization.visualization('synchronize');
      return route;
    }
    if (event.entity instanceof PositionedVertex) {
      if (event.originalEvent.type === 'click') {
        patch.editBy(event.entity);
        preview.clear();
        if (patch.complete) {
          route.patch(...patch.vertices);
          patch.clear();
        }
        visualization.visualization('synchronize');
      } else if (event.originalEvent.type === 'mouseenter') {
        preview.clear();
        preview.vertices = patch.vertices.concat();
        preview.editBy(event.entity);
        if (preview.vertices.length > patch.vertices.length) { // forward
          preview.vertices.splice(0, patch.vertices.length - 1);
        } else if (preview.vertices.length < patch.vertices.length) { // backward
          preview.vertices = patch.vertices.slice(Math.max(preview.vertices.length - 1, 0)).reverse();
        } else { // invalid
          preview.clear();
        }
        visualization.visualization('synchronize');
      } else if (event.originalEvent.type === 'mouseleave') {
        preview.clear();
        visualization.visualization('synchronize');
      }
    }
  }
});

const RETIRE_ROUTE = new Option('Retire Route', function*retireRoute(route) {
  visualization.visualization('setClickability', {});
  if ((yield* showMenu('Really retire this route?', [YES, NO])) === YES) {
    route.retire();
    visualization.visualization('synchronize');
    return undefined;
  }
  return route;
});

const ADD_BUSES = new Option('Add Buses', function*addBuses(route) {
  visualization.visualization('setClickability', {
    vertices: true,
    edges: true,
  });
  for (;;) {
    const event = yield* showMenu('Adding buses…', [DONE]);
    if (event === DONE) {
      return route;
    }
    if (event.entity instanceof PositionedVertex && event.originalEvent.type === 'click') {
      const arc = route.getArc(event.entity);
      if (arc !== undefined) {
        const bus = new Bus(arc, BUS_CAPACITY);
        bus.start();
        visualization.visualization('synchronize');
      }
    } else if (event.entity instanceof PositionedEdge && event.originalEvent.type === 'click') {
      const arc = getArc(route, event.entity);
      if (arc !== undefined) {
        const bus = new Bus(arc, BUS_CAPACITY);
        bus.start();
        visualization.visualization('synchronize');
      }
    }
  }
});

const STOP_BUS = new Option('Stop Bus', function*stopBus(bus) {
  visualization.visualization('setClickability', {});
  if ((yield* showMenu('Really stop this bus?', [YES, NO])) === YES) {
    bus.stop();
    visualization.visualization('synchronize');
    return undefined;
  }
  return bus;
});

const MENUS = new Map();
MENUS.set(undefined, {
  prompt: '',
  options: [ADD_ROUTE],
});
MENUS.set(Route, {
  prompt: '',
  options: [ADD_BUSES, CHANGE_ROUTE, RETIRE_ROUTE],
});
MENUS.set(Bus, {
  prompt: '',
  options: [STOP_BUS],
});
MENUS.set(Passenger, {
  prompt: '',
  options: [],
});

const READY = Symbol('READY');

const main = new Coprogram(function*main() {
  // Wait for simulation to be ready.
  while ((yield) !== READY); // eslint-disable-line curly, no-empty
  // Start with nothing selected.
  let selection = undefined;
  visualization.visualization('setSelection', selection);
  selectionControls.html(convertSelectionToHTML(selection));
  let menu = MENUS.get(undefined);
  // Start with a simulation slowness of 1000, adjustable by a factor of 1.1.
  let slowness = 1000;
  visualization.visualization('setSlowness', slowness);
  const slowButton = $('<button>🐢</button>').on('click', () => {
    slowness *= 1.1; // eslint-disable-line no-magic-numbers
    visualization.visualization('setSlowness', slowness);
  });
  const pauseButton = $('<button>⏸</button>').on('click', () => {
    if (Number.isFinite(visualization.visualization('getSlowness'))) {
      visualization.visualization('setSlowness', Infinity);
    } else {
      visualization.visualization('setSlowness', slowness);
    }
  });
  const fastButton = $('<button>🐇</button>').on('click', () => {
    slowness /= 1.1; // eslint-disable-line no-magic-numbers
    visualization.visualization('setSlowness', slowness);
  });
  speedControls.empty().append(slowButton).append(' ').append(pauseButton).append(' ').append(fastButton);
  // Process UI events.
  for (;;) {
    visualization.visualization('setClickability', {
      background: true,
      vertices: true,
      edges: true,
      buses: true,
      passengers: true,
    });
    const event = yield* showMenu(menu.prompt, menu.options);
    if (event.originalEvent !== undefined && event.originalEvent.type === 'click') {
      if (event.entity === undefined) {
        selection = undefined;
      } else if (event.entity instanceof Bus && !event.entity.stopping || event.entity instanceof Passenger) {
        selection = event.entity;
      } else if (event.entity instanceof PositionedVertex || event.entity instanceof PositionedEdge) {
        // Rotate through matching routes when a vertex or edge is clicked.
        const startingIndex = selection !== undefined ? city.routes.indexOf(selection) + 1 : 0;
        selection = undefined;
        for (let index = startingIndex; index < city.routes.length; ++index) {
          const candidate = city.routes[index];
          if (candidate !== undefined && !candidate.moribund && (candidate.has(event.entity) || hasEdge(candidate, event.entity))) {
            selection = candidate;
            break;
          }
        }
      } else {
        console.assert(false, `Received unexpected event: selection of ${event.entity}`);
      }
    } else if (event instanceof Option) {
      selection = yield* event.action(selection);
    }
    visualization.visualization('setSelection', selection);
    selectionControls.html(convertSelectionToHTML(selection));
    menu = MENUS.get(selection !== undefined ? selection.constructor : undefined);
  }
});

// Start the app.

visualization.visualization({
  city,
  passengers,
  ready() {
    main.unblock(READY);
  },
  interact(event) {
    main.unblock(event);
  },
});
main.run();
