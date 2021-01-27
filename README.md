# ![Linked Data Graphic](https://raw.githubusercontent.com/chigix/linked-data-graphic/master/projects/doc-app/src/assets/repository-open-graph.png)

An Angular Module to have a Linked Data Visualization similar to neo4j.

[![@ngld/canvas](https://img.shields.io/npm/v/@ngld/canvas.svg?logo=npm&logoColor=fff&label=@ngld/canvas&color=limegreen)](https://www.npmjs.com/package/@ngld/canvas)
[![@ngld/icon](https://img.shields.io/npm/v/@ngld/icon.svg?logo=npm&logoColor=fff&label=@ngld/icon&color=limegreen)](https://www.npmjs.com/package/@ngld/icon)
[![@ngld/pan-zoom](https://img.shields.io/npm/v/@ngld/pan-zoom.svg?logo=npm&logoColor=fff&label=@ngld/pan-zoom&color=limegreen)](https://www.npmjs.com/package/@ngld/pan-zoom)
[![@ngld/transition](https://img.shields.io/npm/v/@ngld/transition.svg?logo=npm&logoColor=fff&label=@ngld/transition&color=limegreen)](https://www.npmjs.com/package/@ngld/transition)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

## Features

* Compaptible with the Neo4j data format
* Compatible the D3.js data format: https://github.com/d3/d3-force#link_links , https://github.com/d3/d3-force#simulation_nodes
* Force simulation.
* Angular directives for event binding of hovering on nodes and relationshipis.
* A default info panel component that can be simply connected to the graph.
* An Angular Service to customize node colors of fill and strokes.
* Text nodes + Font Awesome icon nodes + SVG image nodes (e.g. using Twitter * Emoji)).
* Sticky nodes (drag to stick, single click to unstick).
* Toolbar to operate graph update
* Highlight nodes on init.
* Relationship auto-orientation.
* Zoom, pan, auto fit.
* More than one relationship between two nodes. (Coming Soon)
* Markers. (Coming Soon)

## Dependency

* Angular >= 10.0.0

## Quick Usage

Install this component through npm:

```bash
npm install @ngld/canvas
```

Add the component's element into the template with a prepared Linked Data set
conforming to D3's [node](https://github.com/d3/d3-force#simulation_nodes) and
[links](https://github.com/d3/d3-force#link_links) structure.

```html
<ngld-canvas [graph]="{ nodes, relationships }" [zoomFit]="true"></ngld-canvas>
```

## Story

This library is greatly inspired by the neo4j visualization library:
https://github.com/eisman/neo4jd3

## License

MIT
