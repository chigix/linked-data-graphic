import { SimpleGraph, D3Relationship, D3Node } from './data-interface';
import { darkenColor } from './utils';
import { ColorProviderService } from './color-provider.service';

/**
 * Not sure whether a service would be better to maintain a graphic data for
 * underlying component
 */

type COLOR_HEX = string;

export interface D3SVGCalculated<PATH> {
  translate: { x: number, y: number };
  // default svg rotation is clockwise
  rotate: number;
  pathDrawn: PATH;
  controlledByDragging: boolean;
  isLongPressing: boolean;
  selected: boolean;
  textTranslate: { x: number, y: number };

  color: {
    fill: COLOR_HEX;
    stroke: COLOR_HEX;
  };
}

export interface ArrowPath {
  // The Arrow Tail : A vector of A -> B -> C -> D
  A1: { x: number, y: number };
  B1: { x: number, y: number };
  C1: { x: number, y: number };
  D1: { x: number, y: number };
  // The Arrow Head: A -> B -> C -> D -> E -> F -> G
  A2: { x: number, y: number };
  B2: { x: number, y: number };
  C2: { x: number, y: number };
  D2: { x: number, y: number };
  E2: { x: number, y: number };
  F2: { x: number, y: number };
  G2: { x: number, y: number };
  // The Arrow Overlay
  A3: { x: number, y: number };
  B3: { x: number, y: number };
  C3: { x: number, y: number };
  D3: { x: number, y: number };
}

export interface CirclePath {
  // Subpanels in Clockwise
  //         A1 --- B1
  //      D1------------C1
  A1: { x: number, y: number };
  B1: { x: number, y: number };
  C1: { x: number, y: number };
  D1: { x: number, y: number };
  R1: { inner: number, outer: number };
}

export interface BoxSize {
  width: number;
  height: number;
}

export class GraphContainer {

  public relationships: (
    D3Relationship & D3SVGCalculated<ArrowPath>
    & { textBoxSize: BoxSize }
  )[] = [];

  public nodes: (D3Node & D3SVGCalculated<CirclePath>)[] = [];

  private rawGraph: SimpleGraph = {
    nodes: [],
    relationships: [],
  };

  constructor(
    private colorGetter: ColorProviderService,
  ) { }

  /**
   * addRelation
   */
  public addRelation(rel: D3Relationship): GraphContainer {
    this.rawGraph.relationships.push(rel);
    this.relationships.push({
      translate: { x: 0, y: 0 },
      rotate: 0, controlledByDragging: false, isLongPressing: false,
      selected: false, textTranslate: { x: 0, y: 0 },
      pathDrawn: {
        A1: { x: 0, y: 0 }, B1: { x: 0, y: 0 }, C1: { x: 0, y: 0 },
        D1: { x: 0, y: 0 },
        A2: { x: 0, y: 0 }, B2: { x: 0, y: 0 }, C2: { x: 0, y: 0 },
        D2: { x: 0, y: 0 }, E2: { x: 0, y: 0 }, F2: { x: 0, y: 0 },
        G2: { x: 0, y: 0 },
        A3: { x: 0, y: 0 }, B3: { x: 0, y: 0 }, C3: { x: 0, y: 0 },
        D3: { x: 0, y: 0 },
      },
      color: { fill: '#68bdf6', stroke: '#4984ac' },
      textBoxSize: { width: 1, height: 1 },
      ...rel
    });
    return this;
  }

  /**
   * addNode
   */
  public addNode(node: D3Node): GraphContainer {
    this.rawGraph.nodes.push(node);
    const color = this.colorGetter.nextColorByName(node.labels[0]);
    this.nodes.push({
      translate: { x: 0, y: 0 },
      rotate: 0, controlledByDragging: false, isLongPressing: false,
      selected: false, textTranslate: { x: 0, y: 0 },
      pathDrawn: {
        A1: { x: 0, y: 0 }, B1: { x: 0, y: 0 }, C1: { x: 0, y: 0 },
        D1: { x: 0, y: 0 }, R1: { inner: 33, outer: 33 },
      },
      color: { fill: color, stroke: darkenColor(color).formatHex() },
      ...node,
    });
    return this;
  }
}
