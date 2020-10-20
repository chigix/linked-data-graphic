import { Component, OnInit, ViewChild, ElementRef, Input, Optional } from '@angular/core';
import { Simulation, forceSimulation, forceCollide, forceManyBody, forceLink, forceCenter, ForceLink } from 'd3-force';
import { SimpleGraph, D3Relationship, D3Node } from './data-interface';
import { ColorProviderService, ColorGetter, DefaultColorProviderService } from './color-provider.service';
import { ActiveIndividualCastService } from './active-individual-cast.service';
import { darkenColor, rotatePoint, rotation, unitaryNormalVector, unitaryVector } from './utils';
import { CdkDragMove } from '@angular/cdk/drag-drop';

type COLOR_HEX = string;

interface ArrowPath {
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

interface BoxSize {
  width: number;
  height: number;
}

interface D3SVGCalculated<PATH> {
  translate: { x: number, y: number };
  // default svg rotation is clockwise
  rotate: number;
  pathDrawn: PATH;
  controlledByDragging: boolean;
  isLongPressing: boolean;
  textTranslate: { x: number, y: number };

  color: {
    fill: COLOR_HEX;
    stroke: COLOR_HEX;
  };
}

@Component({
  selector: 'ngld-canvas',
  templateUrl: './canvas.component.svg',
  styleUrls: ['./component.scss'],
})
export class LinkedDataGraphicComponent implements OnInit {

  @ViewChild('mainCanvas', { static: true })
  mainCanvas: ElementRef<SVGSVGElement>;

  @Input() set graph(g: SimpleGraph) {
    this.rawGraph = g;
    if (this.componentInited) {
      this.updateGraph();
    }
  }

  @Input() nodeRadius = 25;
  @Input() arrowSize = 4;
  @Input() minCollision = 60;
  @Input() zoomFit = false;
  @Input() debug = false;

  d3Graph = {
    relationships: [] as (
      D3Relationship & D3SVGCalculated<ArrowPath>
      & { textBoxSize: BoxSize }
    )[],
    nodes: [] as (D3Node & D3SVGCalculated<void>)[],
  };

  canvasViewBox = {
    minX: 0,
    minY: 0,
    width: 800,
    height: 500,
  };

  private simulation: Simulation<D3Node, D3Relationship>;
  private colorGetter: ColorGetter;
  private componentInited = false;
  private rawGraph: SimpleGraph;
  private initialLoad = true;

  @Input() highlightChecker = (node: D3Node) => false;

  constructor(
    @Optional() private colorProvider: ColorProviderService<LinkedDataGraphicComponent>,
    @Optional() public activeIndividual: ActiveIndividualCastService,
  ) {
    if (!this.activeIndividual) {
      this.activeIndividual = new ActiveIndividualCastService();
    }
    if (!this.colorProvider) {
      this.colorProvider = new DefaultColorProviderService();
    }
  }

  async ngOnInit(): Promise<void> {
    this.colorGetter = this.colorProvider.registerComponent(this);
    this.simulation = this.newSimulation();
    this.componentInited = true;
    this.updateGraph();
    const mainCanvasSize = this.getMainCanvasSize();
    this.canvasViewBox = {
      minX: 0, minY: 0, width: mainCanvasSize.width, height: mainCanvasSize.height,
    };
  }

  private getMainCanvasSize(): { width: number, height: number } {
    return this.mainCanvas.nativeElement.getBoundingClientRect();
  }

  private newSimulation(): Simulation<D3Node, D3Relationship> {
    const simulation = forceSimulation<D3Node, D3Relationship>();
    const mainCanvasSize = this.getMainCanvasSize();
    simulation
      .force('collide', forceCollide()
        .radius(d => this.minCollision).iterations(2))
      .force('charge', forceManyBody())
      .force('link', forceLink<D3Node, D3Relationship>().id(d => d.id + ''))
      .force('center', forceCenter(mainCanvasSize.width / 2, mainCanvasSize.height / 2))
      .on('tick', () => {
        this.d3Graph.nodes.forEach(node => {
          if (!node.controlledByDragging) {
            node.translate.x = node.x;
            node.translate.y = node.y;
          }
        });
        this.d3Graph.relationships.forEach(rel => {
          const center = { x: 0, y: 0 };
          const source = rel.source as D3Node;
          const target = rel.target as D3Node;
          const angle = rotation(source, target);
          rel.rotate = rotation(source, rel.target as D3Node);
          const textPadding = 1;
          // [SOURCE] --textMargin--[TEXT]--textMargin-->[TARGET]
          // [SOURCE] --textMargin--textMargin--[TEXT]-->[TARGET]
          // --textMargin--textMargin--[TEXT]-- = [SOURCE]-->[TARGET]
          const n = unitaryNormalVector(source, target);
          const u = unitaryVector(source, target);
          const textMargin = {
            y: (target.y - source.y - (rel.textBoxSize.width + 10) * u.y) * 0.5,
            x: (target.x - source.x - (rel.textBoxSize.width + 10) * u.x) * 0.5,
          };
          // => u is simple scale of textMargin
          // => n is perpendicular to textMargin
          rel.pathDrawn.A1 = rotatePoint(center, {
            x: 0 + (this.nodeRadius + 1) * u.x - n.x,
            y: 0 + (this.nodeRadius + 1) * u.y - n.y,
          }, angle);
          rel.pathDrawn.B1 = rotatePoint(center, {
            x: textMargin.x - n.x,
            y: textMargin.y - n.y,
          }, angle);
          rel.pathDrawn.C1 = rotatePoint(center, {
            x: textMargin.x,
            y: textMargin.y,
          }, angle);
          rel.pathDrawn.D1 = rotatePoint(center, {
            x: 0 + (this.nodeRadius + 1) * u.x,
            y: 0 + (this.nodeRadius + 1) * u.y,
          }, angle);
          // length(C-B) = length(D-A) = length(n) = 1
          rel.pathDrawn.A2 = rotatePoint(center, {
            x: target.x - source.x - textMargin.x - n.x,
            y: target.y - source.y - textMargin.y - n.y,
          }, angle);
          rel.pathDrawn.B2 = rotatePoint(center, {
            x: target.x - source.x - (this.nodeRadius + 1) * u.x - n.x - u.x * this.arrowSize,
            y: target.y - source.y - (this.nodeRadius + 1) * u.y - n.y - u.y * this.arrowSize,
          }, angle);
          rel.pathDrawn.C2 = rotatePoint(center, {
            x: target.x - source.x - (this.nodeRadius + 1) * u.x - n.x + (n.x - u.x) * this.arrowSize,
            y: target.y - source.y - (this.nodeRadius + 1) * u.y - n.y + (n.y - u.y) * this.arrowSize,
          }, angle);
          rel.pathDrawn.D2 = rotatePoint(center, {
            x: target.x - source.x - (this.nodeRadius + 1) * u.x,
            y: target.y - source.y - (this.nodeRadius + 1) * u.y,
          }, angle);
          rel.pathDrawn.E2 = rotatePoint(center, {
            x: target.x - source.x - (this.nodeRadius + 1) * u.x + (-n.x - u.x) * this.arrowSize,
            y: target.y - source.y - (this.nodeRadius + 1) * u.y + (-n.y - u.y) * this.arrowSize,
          }, angle);
          rel.pathDrawn.F2 = rotatePoint(center, {
            x: target.x - source.x - (this.nodeRadius + 1) * u.x - u.x * this.arrowSize,
            y: target.y - source.y - (this.nodeRadius + 1) * u.y - u.y * this.arrowSize,
          }, angle);
          rel.pathDrawn.G2 = rotatePoint(center, {
            x: target.x - source.x - textMargin.x,
            y: target.y - source.y - textMargin.y,
          }, angle);
          const n1 = unitaryNormalVector(source, target, 50);
          rel.pathDrawn.A3 = rotatePoint(center, {
            x: 0 - n1.x,
            y: 0 - n1.y,
          }, angle);
          rel.pathDrawn.B3 = rotatePoint(center, {
            x: target.x - source.x - n1.x,
            y: target.y - source.y - n1.y,
          }, angle);
          rel.pathDrawn.C3 = rotatePoint(center, {
            x: target.x - source.x + n1.x - n.x,
            y: target.y - source.y + n1.y - n.y,
          }, angle);
          rel.pathDrawn.D3 = rotatePoint(center, {
            x: 0 + n1.x - n.x,
            y: 0 + n1.y - n.y,
          }, angle);
          rel.textTranslate = rotatePoint(center, {
            x: (target.x - source.x) * 0.5
              + n.x * ((rel.rotate > 90 && rel.rotate < 270) ? 2 : -3),
            y: (target.y - source.y) * 0.5
              + n.y * ((rel.rotate > 90 && rel.rotate < 270) ? 2 : -3),
          }, angle);
        });
      }).on('end', () => {
        if (this.zoomFit && this.initialLoad) {
          this.initialLoad = false;
          this.zoomSvgScale();
        }
      });
    return simulation;
  }

  private updateGraph(): void {
    this.rawGraph.relationships.forEach(rel => {
      this.d3Graph.relationships.push({
        translate: { x: 0, y: 0 },
        rotate: 0, controlledByDragging: false, isLongPressing: false,
        textTranslate: { x: 0, y: 0 },
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
    });
    this.rawGraph.nodes.forEach(node => {
      const color = this.colorGetter.nextColorByName(node.labels[0]);
      this.d3Graph.nodes.push({
        translate: { x: 0, y: 0 },
        rotate: 0, controlledByDragging: false, isLongPressing: false,
        textTranslate: { x: 0, y: 0 },
        pathDrawn: null,
        color: { fill: color, stroke: darkenColor(color).hex() },
        ...node,
      });
    });
    // Update each node's x and y positions
    this.simulation.nodes(this.d3Graph.nodes);
    this.simulation.force<ForceLink<D3Node, D3Relationship>>('link')
      .links(this.d3Graph.relationships);
  }

  private zoomSvgScale(): void {
    const bounds = this.mainCanvas.nativeElement.getBBox();
    if (bounds.width * bounds.height === 0) {
      return; // nothing to fit
    }
    this.canvasViewBox = {
      minX: bounds.x, minY: bounds.y,
      width: bounds.width, height: bounds.height,
    };
  }

  onNodeDragging(e: CdkDragMove, node: D3Node & D3SVGCalculated<ArrowPath>): void {
    node.fx = e.pointerPosition.x;
    node.fy = e.pointerPosition.y;
  }

  onNodeDragStart(node: D3Node & D3SVGCalculated<ArrowPath>): void {
    if (node.controlledByDragging || node.isLongPressing) {
      return;
    }
    this.simulation.alphaTarget(0.3).restart();
  }

  onNodeClick(e: MouseEvent, node: D3Node & D3SVGCalculated<ArrowPath>): void {
    if (node.controlledByDragging || node.isLongPressing) {
      node.controlledByDragging = false;
      node.isLongPressing = false;
      return;
    }
    node.fx = node.fy = null;
  }

  onViewBoxChanged(e: {
    minX: number, minY: number, width: number, height: number,
  }): void {
    this.canvasViewBox.minX = e.minX;
    this.canvasViewBox.minY = e.minY;
    this.canvasViewBox.width = e.width;
    this.canvasViewBox.height = e.height;
  }

}
