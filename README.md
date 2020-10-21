# Linked Data Graphic

An Angular Module to have a Linked Data Visualization similar to neo4j.

![preview](https://raw.githubusercontent.com/chigix/linked-data-graphic/master/projects/doc-app/src/assets/repository-open-graph.png)

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
npm install linked-data-graphic
```

Add the component's element into the template with a prepared Linked Data set
conforming to D3's [node](https://github.com/d3/d3-force#simulation_nodes) and
[links](https://github.com/d3/d3-force#link_links) structure.

```html
<ld-graphic [data]="ldData"></ld-graphic>
```

## Story

This library is greatly inspired by the neo4j visualization library:
https://github.com/eisman/neo4jd3
