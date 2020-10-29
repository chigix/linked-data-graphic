import { Component, OnInit, ViewChild, ElementRef, Input, Optional } from '@angular/core';
import { CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { Easing, trigger, transition, render, TransitionService, animate } from '@ngld/transition';
import { PLUS_ICON_PROVIDER } from '@ngld/icon/plus.icon';
import { REMOVE_ICON_PROVIDER } from '@ngld/icon/remove.icon';
import { UNLOCK_ICON_PROVIDER } from '@ngld/icon/unlock.icon';
import { SvgIconRegistry } from '@ngld/icon';
import { BehaviorSubject } from 'rxjs';
import * as rfdc from 'rfdc';
import { Simulation, forceSimulation, forceCollide, forceManyBody, forceLink, forceCenter, ForceLink } from 'd3-force';
import { interpolateZoom } from 'd3-interpolate';
import { SimpleGraph, D3Relationship, D3Node } from './data-interface';
import { GraphContainer } from './graph.container';
import { ColorProviderService, DefaultColorProviderService } from './color-provider.service';
import { ActiveIndividualCastService } from './active-individual-cast.service';
import { rotatePoint, rotation, unitaryNormalVector, unitaryVector } from './utils';


const clone = rfdc();

const interpolateRadius = interpolateZoom([0, 0, 33], [0, 0, 66]);
const cosineStart = Math.cos(2 * Math.PI / 180);
const sineStart = Math.sin(2 * Math.PI / 180);
const cosineEnd = Math.cos(120 * Math.PI / 180);
const sineEnd = Math.sin(120 * Math.PI / 180);

@Component({
  providers: [{
    provide: TransitionService,
    useFactory: () => new TransitionService([
      trigger('openClose', [
        transition((from, to) => from === 'void' && to === 'open', [
          render<GraphContainer['nodes'][0]>((p, node) => {
            const radiusOuter = interpolateRadius(p)[2];
            // sin(2) * 33, cos(2) * 33
            node.pathDrawn.A1 = { x: sineStart * 33, y: - cosineStart * 33 };
            // sin(120) * 33, cos(120) * 33
            node.pathDrawn.B1 = { x: sineEnd * 33, y: - cosineEnd * 33 };
            // sin(120) * 63, cos(120) * 63
            node.pathDrawn.C1 = { x: sineEnd * radiusOuter, y: - cosineEnd * radiusOuter };
            // sin(2) * 63, cos(2) * 63
            node.pathDrawn.D1 = { x: sineStart * radiusOuter, y: - cosineStart * radiusOuter };
            node.pathDrawn.R1.outer = radiusOuter;
          }),
          animate(200, Easing.easeInCubic),
        ]),
        transition((from, to) => from === 'open' && to === 'void', [
          render<GraphContainer['nodes'][0]>((p, node) => {
            const radiusOuter = interpolateRadius(1 - p)[2];
            // sin(2) * 33, cos(2) * 33
            node.pathDrawn.A1 = { x: sineStart * 33, y: - cosineStart * 33 };
            // sin(120) * 33, cos(120) * 33
            node.pathDrawn.B1 = { x: sineEnd * 33, y: - cosineEnd * 33 };
            // sin(120) * 63, cos(120) * 63
            node.pathDrawn.C1 = { x: sineEnd * radiusOuter, y: - cosineEnd * radiusOuter };
            // sin(2) * 63, cos(2) * 63
            node.pathDrawn.D1 = { x: sineStart * radiusOuter, y: - cosineStart * radiusOuter };
            node.pathDrawn.R1.outer = radiusOuter;
          }),
          animate(200, Easing.easeOutCubic),
        ]),
      ]),
    ]),
  }
    , [PLUS_ICON_PROVIDER, REMOVE_ICON_PROVIDER, UNLOCK_ICON_PROVIDER]
    , SvgIconRegistry
  ],
  selector: 'ngld-canvas',
  templateUrl: './canvas.component.svg',
  styleUrls: ['./component.scss'],
})
export class LinkedDataGraphicComponent implements OnInit {

  @ViewChild('mainCanvas', { static: true })
  mainCanvas: ElementRef<SVGSVGElement>;

  @Input() nodeRadius = 25;
  @Input() arrowSize = 4;
  @Input() minCollision = 60;
  @Input() zoomFit = false;
  @Input() set debug(state: boolean) {
    this.$states.debug.next(state);
  }
  @Input() set graph(g: SimpleGraph) {
    this.initGraph = g;
  }

  $states = {
    debug: new BehaviorSubject(false),
    // dashedArrow: new BehaviorSubject<{ from: D3Node, to: D3Node }>(null),
  };
  d3Graph: GraphContainer;

  canvasViewBox = {
    minX: 0,
    minY: 0,
    width: 800,
    height: 500,
  };

  private simulation: Simulation<D3Node, D3Relationship>;
  private initGraph: SimpleGraph;
  private initialLoad = true;
  private selectedNode: GraphContainer['nodes'][0];

  @Input() highlightChecker = (node: D3Node) => false;

  constructor(
    private transitionService: TransitionService,
    @Optional() private colorProvider: ColorProviderService,
    @Optional() public activeIndividual: ActiveIndividualCastService,
  ) {
    if (!this.activeIndividual) {
      this.activeIndividual = new ActiveIndividualCastService();
    }
    if (!this.colorProvider) {
      this.colorProvider = new DefaultColorProviderService();
    }
    this.d3Graph = new GraphContainer(this.colorProvider);
  }

  async ngOnInit(): Promise<void> {
    this.simulation = this.newSimulation();
    this.initGraph.nodes.forEach(node => this.d3Graph.addNode(clone(node)));
    this.initGraph.relationships.forEach(rel => this.d3Graph.addRelation(clone(rel)));
    this.reloadSimulation();
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

  private reloadSimulation(): void {
    this.simulation.nodes(this.d3Graph.nodes);
    this.simulation.force<ForceLink<D3Node, D3Relationship>>('link')
      .links(this.d3Graph.relationships);
    this.simulation.alphaTarget(0).restart();
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

  onNodeDragging(e: CdkDragMove, node: GraphContainer['nodes'][0]): void {
    node.fx = e.pointerPosition.x;
    node.fy = e.pointerPosition.y;
  }

  onNodeDragStart(node: GraphContainer['nodes'][0]): void {
    if (node.controlledByDragging || node.isLongPressing) {
      return;
    }
    this.simulation.alphaTarget(0.1).restart();
  }

  onNodeDragEnd(e: CdkDragEnd, node: GraphContainer['nodes'][0]): void {
    node.controlledByDragging = true;
    this.simulation.alphaTarget(0);
  }

  onNodeClick(e: MouseEvent, node: GraphContainer['nodes'][0]): void {
    if (node.controlledByDragging || node.isLongPressing) {
      node.controlledByDragging = false;
      node.isLongPressing = false;
      return;
    }
    node.fx = node.fy = null;
    if (node.selected) {
      this.selectedNode = null;
      this.transitionService.animate('openClose', 'open', 'void', node)
        .then(_ => node.selected = false);
    } else {
      node.selected = true;
      if (this.selectedNode) {
        const previousNode = this.selectedNode;
        this.transitionService
          .animate('openClose', 'open', 'void', this.selectedNode)
          .then(_ => previousNode.selected = false);
      }
      this.selectedNode = node;
      this.transitionService.animate('openClose', 'void', 'open', node);
    }
  }

  onViewBoxChanged(e: {
    minX: number, minY: number, width: number, height: number,
  }): void {
    this.canvasViewBox.minX = e.minX;
    this.canvasViewBox.minY = e.minY;
    this.canvasViewBox.width = e.width;
    this.canvasViewBox.height = e.height;
  }

  onPlusNodeButton(node: GraphContainer['nodes'][0]): void {
    this.d3Graph.addRelation(
      { id: 'bankai', type: 'for', source: '1', target: node.id, properties: { from: 1 } },
    );
    this.reloadSimulation();
  }

}
