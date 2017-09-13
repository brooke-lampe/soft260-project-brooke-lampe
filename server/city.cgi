#! /usr/bin/python3

import cgi
import slugify
import json

import matplotlib
matplotlib.use('Agg')  # Select a Matplotlib backend that's guaranteed to work in headless mode before loading OSMnx.
import osmnx


def load_cached_graph(filename):
    return osmnx.load_graphml(filename)


def acquire_graph(filename, address, radius):
    # see osmnx.osm_net_download for network types
    graph, center = osmnx.graph_from_address(address, distance=radius, network_type='all', return_coords=True)
    graph.graph['center'] = center
    osmnx.save_graphml(graph, filename=filename)
    return graph


def load_graph(address, radius):
    filename = '{slug}.{radius}.graphml'.format(slug=slugify.slugify(address), radius=radius)
    try:
        return load_cached_graph(filename)
    except FileNotFoundError:
        return acquire_graph(filename, address, radius)


def to_json(graph, scale=1):
    center = [0, 0]
    count = 0
    for entry in graph.nodes(data=True):
        center[0] += entry[1]['x']
        center[1] += entry[1]['y']
        count += 1
    center = (center[0] / count, center[1] / count)

    def transform(position):
        return (position[0] - center[0]) * scale, -(position[1] - center[1]) * scale

    vertices_dictionary = {entry[0]: (entry[1]['x'], entry[1]['y']) for entry in graph.nodes(data=True)}
    data = {
        'vertices': [
            {
                'name': name,
                'position': transform(position),
            } for name, position in vertices_dictionary.items()
        ],
        'edges': [
            {
                'source': entry[0],
                'destination': entry[1],
                'length': entry[2]['length'],
                'path': tuple(transform((x, y)) for x, y in zip(*entry[2]['geometry'].xy)) if 'geometry' in entry[2]
                else (transform(vertices_dictionary[entry[0]]), transform(vertices_dictionary[entry[1]]))
            } for entry in graph.edges(data=True)
        ]
    }
    return json.dumps(data)


def main():
    address = cgi.FieldStorage().getfirst('address')
    if address is None:
        address = 'Avery Hall, Lincoln, NE, USA'
    try:
        radius = int(cgi.FieldStorage().getfirst('radius'))
    except (ValueError, TypeError):
        radius = 200
    graph = load_graph(address, radius)
    content = to_json(graph, scale=500000)
    print('Content-Type: application/json\n\n{content}'.format(content=content))


if __name__ == '__main__':
    main()
