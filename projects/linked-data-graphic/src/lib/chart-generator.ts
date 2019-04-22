import { rgb } from 'd3-color';
import { select as d3Select, Selection, event as d3Event } from 'd3-selection';
import { drag as d3Drag } from 'd3-drag';
import {
  Simulation,
  forceLink,
  ForceLink,
  forceCenter,
  forceSimulation,
  forceCollide,
  forceManyBody,
} from 'd3-force';
import {
  COLORS, fontAwesomeIcons,
  darkenColor, rotation, unitaryNormalVector,
  rotatePoint, unitaryVector,
} from './utils';
import { D3Node, D3Relationship, isD3Node } from './data-interface';

export interface D3Data {
  nodes: D3Node[];
  relationships: D3Relationship[];
}

export interface OntologyGraph {
  appendRandomDataToNode(data, maxNodesToGenerate): void;
  size(): {
    nodes: number,
    relationships: number,
  };
  updateData(d3Data: D3Data): void;
  version(): string;
}

export interface GraphOptions {
  arrowSize?: number;
  colors?: typeof COLORS;
  // TODO: apply the defined Highlight css style
  highlight?: (data: D3Node) => boolean;
  iconMap?: { [x: string]: any };
  imageMap?: {};
  minCollision?: number;
  nodeOutlineFillColor?: string;
  nodeRadius?: number;
  relationshipColor?: string;
  zoomFit?: boolean;
  onRelationshipDoubleClick?: (d: D3Relationship) => void;
}

export interface NodeEventListener {
  onNodeClick?: (node: D3Node) => void;
  onNodeDoubleClick?: (node: D3Node) => void;
  onNodeMouseEnter?: (node: D3Node) => void;
  onNodeMouseLeave?: (node: D3Node) => void;
  onNodeDragStart?: (node: D3Node) => void;
  onNodeDragEnd?: (node: D3Node) => void;
}

export function LinkedDataGraphic(
  svg: SVGSVGElement, infoPanel: HTMLDivElement | null,
  options: GraphOptions,
  eventListeners: NodeEventListener): Promise<OntologyGraph> {
  options = {
    ...{
      arrowSize: 4,
      colors: COLORS,
      iconMap: fontAwesomeIcons(),
      nodeRadius: 25,
      relationshipColor: '#a5abb6',
      zoomFit: false,
      highlight: d => false,
    }, ...options
  };
  (function initIconMap() { })();
  (function initMinCollision() {
    if (!options.minCollision) {
      options.minCollision = options.nodeRadius * 2;
    }
  })();
  (function initImageMap() { })();
  const graphContext: GraphContext = {
    info: infoPanel ? d3Select(infoPanel) : undefined,
    svg: d3Select(svg),
    nodes: [],
    relationships: [],
    classes2colors: {},
    justLoaded: false,
    infoClassesCount: 0,
  };
  initGraph(graphContext);
  initSimulation(graphContext, options);
  const graph = new OntologyGraphImpl(graphContext, {
    onRelationshipDoubleClick: options.onRelationshipDoubleClick,
    nodeOutlineFillColor: options.nodeOutlineFillColor,
    presetColors: options.colors,
    relationshipColor: options.relationshipColor,
    highlight: options.highlight,
    nodeRadius: options.nodeRadius,
  }, eventListeners);
  return Promise.resolve(graph);
}

interface GraphContext {
  readonly info?: Selection<HTMLDivElement, {}, HTMLElement, any>;
  readonly nodes: D3Node[];
  relationshipOutline?: Selection<SVGPathElement, D3Relationship, SVGGElement, {}>;
  relationshipOverlay?: Selection<SVGPathElement, D3Relationship, SVGGElement, {}>;
  relationshipText?: Selection<SVGTextElement, D3Relationship, SVGGElement, {}>;
  readonly relationships: D3Relationship[];
  simulation?: Simulation<D3Node, D3Relationship>;
  readonly svg: Selection<SVGSVGElement, {}, HTMLElement, any>;
  svgNodes?: Selection<SVGGElement, {}, HTMLElement, any>;
  svgNode?: Selection<SVGGElement, D3Node, SVGGElement, {}>;
  svgRelationships?: Selection<SVGGElement, {}, HTMLElement, any>;
  svgRelationship?: Selection<SVGGElement, D3Relationship, SVGGElement, {}>;
  svgScale?: number;
  svgTranslate?: number[]; // It looks like [x, y]
  classes2colors: { [key: string]: string };
  justLoaded: boolean;
  infoClassesCount: number;
}

class OntologyGraphImpl implements OntologyGraph {
  constructor(
    private ctx: GraphContext,
    private options: {
      onRelationshipDoubleClick?: (d: D3Relationship) => void,
      nodeOutlineFillColor?: string,
      presetColors: typeof COLORS,
      relationshipColor: string,
      highlight: (data: D3Node) => boolean,
      nodeRadius: number,
    },
    private nodeEventListeners: NodeEventListener
  ) { }

  appendRandomDataToNode(data: any, maxNodesToGenerate: any): void {
    throw new Error('Method not implemented.');
  }

  size() {
    return {
      nodes: this.ctx.nodes.length,
      relationships: this.ctx.relationships.length,
    };
  }

  updateData(d3Data: D3Data): void {
    this.updateRelationships(d3Data.relationships);
    this.updateNodes(d3Data.nodes);
    this.ctx.simulation.nodes(this.ctx.nodes);
    this.ctx.simulation.force<ForceLink<D3Node, D3Relationship>>('link')
      .links(this.ctx.relationships);
  }

  private class2color(cls: string) {
    let color = this.ctx.classes2colors[cls];
    if (color) {
      return color;
    }
    color = this.options.presetColors[
      this.ctx.infoClassesCount++ % this.options.presetColors.length
    ];
    this.ctx.classes2colors[cls] = color;
    return color;
  }

  private updateRelationships(relationships: D3Relationship[]) {
    Array.prototype.push.apply(this.ctx.relationships, relationships);
    this.ctx.svgRelationship =
      this.ctx.svgRelationships.selectAll<SVGGElement, D3Relationship>('.relationship')
        .data(this.ctx.relationships, (d) => d.id + '');
    const relationship = this.ctx.svgRelationship.enter()
      .append('g').attr('class', 'relationship')
      .attr('dblclick', d => {
        if (this.options.onRelationshipDoubleClick) {
          this.options.onRelationshipDoubleClick(d);
        }
        // TODO: Check again about the return value
        return null;
      }).on('mouseenter', d => {
        if (this.ctx.info) {
          updateInfo(this.ctx.info, d, {
            nodeOutlineFillColor: this.options.nodeOutlineFillColor,
            presetColors: this.options.presetColors,
            relationshipColor: this.options.relationshipColor,
            class2color: cls => this.class2color(cls),
          });
        }
      }).on('mouseleave', d => {
        clearInfo(this.ctx.info);
      });
    const text = relationship.append('text')
      .attr('class', 'text').attr('fill', '#000000')
      .attr('font-size', '8px').attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .text(d => d.type);
    const outline = relationship.append('path')
      .attr('class', 'outline').attr('fill', '#a5abb6')
      .attr('stroke', 'none');
    const overlay = relationship.append('path').attr('class', 'overlay');
    this.ctx.svgRelationship = relationship.merge(this.ctx.svgRelationship);
    this.ctx.relationshipOutline = outline.merge(
      this.ctx.svgRelationship.selectAll<SVGPathElement, D3Relationship>('.relationship .outline'));
    this.ctx.relationshipOverlay = overlay.merge(
      this.ctx.svgRelationship.selectAll<SVGPathElement, D3Relationship>('.relationship .overlay'));
    this.ctx.relationshipText = text.merge(
      this.ctx.svgRelationship.selectAll<SVGTextElement, D3Relationship>('.relationship .text'));
  }

  private updateNodes(nodes: D3Node[]) {
    Array.prototype.push.apply(this.ctx.nodes, nodes);
    this.ctx.svgNode = this.ctx.svgNodes.selectAll<SVGGElement, D3Node>('.node')
      .data(this.ctx.nodes, d => d.id + '');
    const nodeEnter = nodeEnterAppend(
      this.ctx.svgNode, this.ctx.simulation, {
        ...{
          highlight: this.options.highlight,
          // =========
          nodeOutlineFillColor: this.options.nodeOutlineFillColor,
          presetColors: this.options.presetColors,
          relationshipColor: this.options.relationshipColor,
          class2color: cls => this.class2color(cls),
        }, ...this.nodeEventListeners
      }, this.ctx.info);
    nodeEnter.append('circle')
      .attr('class', 'ring').attr('r', this.options.nodeRadius * 1.16)
      .append('title').text(d => `${(d.labels[0] || '---')} [${d.id}]`);
    nodeEnter.append('circle')
      .attr('class', 'outline').attr('r', this.options.nodeRadius)
      .style('fill', d => this.options.nodeOutlineFillColor
        || this.class2color(d.labels[0]))
      .style('stroke', d => this.options.nodeOutlineFillColor ?
        darkenColor(this.options.nodeOutlineFillColor).toString() :
        darkenColor(this.class2color(d.labels[0])).toString()
      ).append('title').text(d => `${(d.labels[0] || '---')} [${d.id}]`);
    nodeEnter.append('text')
      .attr('class', d => 'text').attr('fill', '#ffffff')
      .attr('font-size', d => '10px').attr('pointer-events', 'none')
      .attr('text-anchor', 'middle').attr('y', d => '4px')
      .html(d => [
        '#' + d.id, d.labels.join(' ')
      ].join('-'));
    this.ctx.svgNode = nodeEnter.merge(this.ctx.svgNode);
  }

  version() {
    return '0.0.1';
  }

}

function initGraph(ctx: GraphContext) {
  // Zoom event should be controlled through Angular
  // const zoomBehavior = D3.zoom().on('zoom', () => {
  //   const translate = [D3.event.transform.x, D3.event.transform.y];
  //   if (ctx.svgTranslate) {
  //     translate[0] += ctx.svgTranslate[0];
  //     translate[1] += ctx.svgTranslate[1];
  //   }
  //   const scale = D3.event.transform.k * (ctx.svgScale || 1);
  //   ctx.svg.attr('transform',
  //     `translate(${translate[0]}, ${translate[1]}) scale(${scale})`);
  // });
  // zoomBehavior(ctx.svg);
  ctx.svg
    .on('dblclick.zoom', null)
    .append('g')
    .attr('width', '100%')
    .attr('height', '100%');
  ctx.svgRelationships = ctx.svg.append('g').attr('class', 'relationships');
  ctx.svgNodes = ctx.svg.append('g').attr('class', 'nodes');
}

function initSimulation(ctx: GraphContext, opts: GraphOptions) {
  ctx.simulation = forceSimulation<D3Node, D3Relationship>()
    .force('collide',
      forceCollide().radius(d => opts.minCollision)
        .iterations(2))
    .force('charge', forceManyBody())
    .force('link', forceLink<D3Node, D3Relationship>()
      .id((d) => d.id + ''))
    .force('center', forceCenter(
      ctx.svg.node().parentElement.parentElement.clientWidth / 2,
      ctx.svg.node().parentElement.parentElement.clientHeight / 2))
    .on('tick', () => {
      if (!ctx.svgNode || !ctx.svgRelationship
        || !ctx.relationshipText || !ctx.relationshipOverlay) {
        return;
      }
      ctx.svgNode.attr('transform', d => `translate(${d.x},${d.y})`);
      ctx.svgRelationship.attr('transform', d => {
        const source = d.source as D3Node;
        return `translate(${source.x}, ${source.y}) `
          // default svg rotation is clockwise
          + `rotate(${rotation(source, d.target as D3Node)})`;
      });
      ctx.relationshipText.attr('transform', d => {
        const source = d.source as D3Node;
        const target = d.target as D3Node;
        const angle = (rotation(source, target) + 360) % 360;
        const ifMirror = angle > 90 && angle < 270;
        const n = unitaryNormalVector(source, target);
        const nWeight = ifMirror ? 2 : -3;
        const point = {
          x: (target.x - source.x) * 0.5 + n.x * nWeight,
          y: (target.y - source.y) * 0.5 + n.y * nWeight,
        };
        const rotatedPoint = rotatePoint({ x: 0, y: 0 }, point, angle);
        return `translate(${rotatedPoint.x}, ${rotatedPoint.y}) `
          + `rotate(${ifMirror ? 180 : 0})`;
      });
      ctx.svgRelationship.each(function (relationship) {
        const rel = d3Select<SVGGElement, typeof relationship>(this);
        const outline = rel.select<SVGPathElement>('.outline');
        const text = rel.select<SVGTextElement>('.text');
        outline.attr('d', d => {
          const center = { x: 0, y: 0 };
          const source = d.source as D3Node;
          const target = d.target as D3Node;
          const angle = rotation(source, target);
          const textBoundingBox = text.node().getBBox();
          const textPadding = 5;
          const u = unitaryVector(source, target);
          // [SOURCE] --textMargin--[TEXT]--textMargin-->[TARGET]
          // [SOURCE] --textMargin--textMargin--[TEXT]-->[TARGET]
          // --textMargin--textMargin--[TEXT]-- = [SOURCE]-->[TARGET]
          const textMargin = {
            x: (target.x - source.x - (textBoundingBox.width + textPadding) * u.x) * 0.5,
            y: (target.y - source.y - (textBoundingBox.width + textPadding) * u.y) * 0.5,
          };
          const n = unitaryNormalVector(source, target);
          const rotatedPointA1 = rotatePoint(center, {
            x: 0 + (opts.nodeRadius + 1) * u.x - n.x,
            y: 0 + (opts.nodeRadius + 1) * u.y - n.y,
          }, angle);
          const rotatedPointB1 = rotatePoint(center, {
            x: textMargin.x - n.x,
            y: textMargin.y - n.y,
          }, angle);
          const rotatedPointC1 = rotatePoint(center, {
            x: textMargin.x,
            y: textMargin.y,
          }, angle);
          const rotatedPointD1 = rotatePoint(center, {
            x: 0 + (opts.nodeRadius + 1) * u.x,
            y: 0 + (opts.nodeRadius + 1) * u.y,
          }, angle);
          const rotatedPointA2 = rotatePoint(center, {
            x: target.x - source.x - textMargin.x - n.x,
            y: target.y - source.y - textMargin.y - n.y,
          }, angle);
          const rotatedPointB2 = rotatePoint(center, {
            x: target.x - source.x - (opts.nodeRadius + 1) * u.x - n.x - u.x * opts.arrowSize,
            y: target.y - source.y - (opts.nodeRadius + 1) * u.y - n.y - u.y * opts.arrowSize,
          }, angle);
          const rotatedPointC2 = rotatePoint(center, {
            x: target.x - source.x - (opts.nodeRadius + 1) * u.x - n.x + (n.x - u.x) * opts.arrowSize,
            y: target.y - source.y - (opts.nodeRadius + 1) * u.y - n.y + (n.y - u.y) * opts.arrowSize,
          }, angle);
          const rotatedPointD2 = rotatePoint(center, {
            x: target.x - source.x - (opts.nodeRadius + 1) * u.x,
            y: target.y - source.y - (opts.nodeRadius + 1) * u.y,
          }, angle);
          const rotatedPointE2 = rotatePoint(center, {
            x: target.x - source.x - (opts.nodeRadius + 1) * u.x + (-n.x - u.x) * opts.arrowSize,
            y: target.y - source.y - (opts.nodeRadius + 1) * u.y + (-n.y - u.y) * opts.arrowSize,
          }, angle);
          const rotatedPointF2 = rotatePoint(center, {
            x: target.x - source.x - (opts.nodeRadius + 1) * u.x - u.x * opts.arrowSize,
            y: target.y - source.y - (opts.nodeRadius + 1) * u.y - u.y * opts.arrowSize,
          }, angle);
          const rotatedPointG2 = rotatePoint(center, {
            x: target.x - source.x - textMargin.x,
            y: target.y - source.y - textMargin.y,
          }, angle);
          return `M ${rotatedPointA1.x} ${rotatedPointA1.y}` +
            ` L ${rotatedPointB1.x} ${rotatedPointB1.y}` +
            ` L ${rotatedPointC1.x} ${rotatedPointC1.y}` +
            ` L ${rotatedPointD1.x} ${rotatedPointD1.y}` +
            ' Z ' +
            `M ${rotatedPointA2.x} ${rotatedPointA2.y}` +
            ` L ${rotatedPointB2.x} ${rotatedPointB2.y}` +
            ` L ${rotatedPointC2.x} ${rotatedPointC2.y}` +
            ` L ${rotatedPointD2.x} ${rotatedPointD2.y}` +
            ` L ${rotatedPointE2.x} ${rotatedPointE2.y}` +
            ` L ${rotatedPointF2.x} ${rotatedPointF2.y}` +
            ` L ${rotatedPointG2.x} ${rotatedPointG2.y}` +
            ' Z';
        });
        ctx.relationshipOverlay.attr('d', d => {
          const center = { x: 0, y: 0 };
          const source = d.source as D3Node;
          const target = d.target as D3Node;
          const angle = rotation(source, target);
          const n1 = unitaryNormalVector(source, target);
          const n = unitaryNormalVector(source, target, 50);
          const rotatedPointA = rotatePoint(center, {
            x: 0 - n.x,
            y: 0 - n.y,
          }, angle);
          const rotatedPointB = rotatePoint(center, {
            x: target.x - source.x - n.x,
            y: target.y - source.y - n.y,
          }, angle);
          const rotatedPointC = rotatePoint(center, {
            x: target.x - source.x + n.x - n1.x,
            y: target.y - source.y + n.y - n1.y,
          }, angle);
          const rotatedPointD = rotatePoint(center, {
            x: 0 + n.x - n1.x,
            y: 0 + n.y - n1.y,
          }, angle);
          return `M ${rotatedPointA.x} ${rotatedPointA.y}` +
            ` L ${rotatedPointB.x} ${rotatedPointB.y}` +
            ` L ${rotatedPointC.x} ${rotatedPointC.y}` +
            ` L ${rotatedPointD.x} ${rotatedPointD.y}` +
            ' Z';
        });
      }).on('end', () => {
        if (!opts.zoomFit || ctx.justLoaded) {
          return;
        }
        ctx.justLoaded = true;
        const bounds = ctx.svg.node().getBBox();
        const parent = ctx.svg.node().parentElement.parentElement;
        const fullWidth = parent.clientWidth;
        const fullHeight = parent.clientHeight;
        const midX = bounds.x + bounds.width / 2;
        const midY = bounds.y + bounds.height / 2;
        if (bounds.width === 0 || bounds.height === 0) {
          return; // Nothing to fit
        }
        ctx.svgScale = 0.85 / Math.max(
          bounds.width / fullWidth, bounds.height / fullHeight,
        );
        ctx.svgTranslate = [
          fullWidth / 2 - ctx.svgScale * midX,
          fullHeight / 2 - ctx.svgScale * midY,
        ];
        ctx.svg.attr('transform',
          `translate(${ctx.svgTranslate[0]}, ${ctx.svgTranslate[1]})` +
          ` scale(${ctx.svgScale})`);
      });
    });
}

function clearInfo(info: Selection<HTMLDivElement, {}, HTMLElement, any>) {
  info.html('');
}

function updateInfo(
  info: Selection<HTMLDivElement, {}, HTMLElement, any>,
  d: D3Node | D3Relationship,
  opts: {
    nodeOutlineFillColor?: string,
    relationshipColor: string,
    presetColors: typeof COLORS,
    class2color: (cls: string) => string,
  }) {
  // TODO: The functions operating on the info panel div
  //       should be completely rewrite in angular.
  function appendInfoElement(cls: string, isNode: boolean, property: string, value?: string) {
    const defaultDarkenColor =
      rgb(opts.presetColors[opts.presetColors.length - 1]).darker(1);
    const elem = info.append('a');
    elem.attr('href', '#').attr('class', cls)
      .html(`<strong>${property}</strong>` +
        (value ? (': ' + value) : ''));
    if (!value) {
      elem.style('background-color', _ => {
        return opts.nodeOutlineFillColor ?
          opts.nodeOutlineFillColor :
          (isNode ? opts.class2color(property) : opts.relationshipColor);
      }).style('border-color', _ => {
        return (opts.nodeOutlineFillColor ?
          darkenColor(opts.nodeOutlineFillColor) :
          (isNode ?
            darkenColor(opts.class2color(property)) : defaultDarkenColor))
          .toString();
      }).style('color', _ => {
        return opts.nodeOutlineFillColor ?
          darkenColor(opts.nodeOutlineFillColor).toString() : '#fff';
      });
    }
  }
  if (isD3Node(d)) {
    appendInfoElement('class', true, d.labels[0]);
  } else {
    appendInfoElement('class', false, d.type);
  }
  appendInfoElement('property', false, '&lt;id&gt;', d.id + '');
  for (const property in d.properties) {
    if (d.properties.hasOwnProperty(property)) {
      appendInfoElement('property', false,
        property, JSON.stringify(d.properties[property]));
    }
  }
}

function nodeEnterAppend(
  svgNode: Selection<SVGGElement, D3Node, SVGGElement, {}>,
  simulation: Simulation<D3Node, D3Relationship>,
  opts: {
    highlight: (data: D3Node) => boolean,
    // =================
    nodeOutlineFillColor?: string,
    relationshipColor: string,
    presetColors: typeof COLORS,
    class2color: (cls: string) => string,
  } & NodeEventListener,
  infoPanel?: Selection<HTMLDivElement, {}, HTMLElement, any>) {
  const dragBehavior = d3Drag<SVGGElement, D3Node>()
    .on('start', d => {
      if (!d3Event.active) {
        simulation.alphaTarget(0.3).restart();
      }
      d.fx = d.x;
      d.fy = d.y;
      if (opts.onNodeDragStart) {
        opts.onNodeDragStart(d);
      }
    }).on('drag', d => {
      d.fx = d3Event.x;
      d.fy = d3Event.y;
    }).on('end', d => {
      if (!d3Event.active) {
        simulation.alphaTarget(0);
      }

      if (opts.onNodeDragEnd) {
        opts.onNodeDragEnd(d);
      }
    });
  return svgNode.enter().append('g').attr('class', d => {
    let classes = 'node';
    // Check if there is corresponding icon
    // Check if there is corresponding image
    if (opts.highlight(d)) {
      classes += ' node-highlighted';
    }
    return classes;
  }).on('click', d => {
    d.fx = d.fy = null;
    if (typeof opts.onNodeClick === 'function') {
      opts.onNodeClick(d);
    }
  }).on('dblclick', d => {
    d.fx = d3Event.clientX;
    d.fy = d3Event.clientY;
    if (opts.onNodeDoubleClick) {
      opts.onNodeDoubleClick(d);
    }
  }).on('mouseenter', d => {
    if (infoPanel) {
      updateInfo(infoPanel, d, opts);
    }

    if (opts.onNodeMouseEnter) {
      opts.onNodeMouseEnter(d);
    }
  }).on('mouseleave', d => {
    if (infoPanel) {
      clearInfo(infoPanel);
    }
    if (opts.onNodeMouseLeave) {
      opts.onNodeMouseLeave(d);
    }
  }).call(dragBehavior);
}
