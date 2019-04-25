# Linked Data Graphic

Linked Data Graphic and Visualization Components for Angular

![preview](https://raw.githubusercontent.com/chigix/linked-data-graphic/master/src/assets/repository-open-graph.png)

## Dependency

* Angular >= 7.0.0

## Quick Usage

Install this component through npm:

```bash
npm install linked-data-graphic
```

Add the component's element into the template with a prepared Linked Data set
conforming to D3's [node](https://github.com/d3/d3-force#simulation_nodes) and
[links](https://github.com/d3/d3-force#link_links) structure.

```html
<chigix-ld-graphic [data]="ldData"></chigix-ld-graphic>
```

## Build

Run `npm run build-release` to build the component library.
The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `npm run test` to execute the unit tests via [Karma](https://karma-runner.github.io).
