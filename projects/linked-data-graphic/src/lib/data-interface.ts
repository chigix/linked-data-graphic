import { SimulationLinkDatum, SimulationNodeDatum } from 'd3-force';

export interface SimpleGraph {
  nodes: D3Node[];
  relationships: D3Relationship[];
}

export interface D3Node extends SimulationNodeDatum {
  labels: string[];
  id: string;
  properties: { [key: string]: string };
}

export interface D3Relationship extends SimulationLinkDatum<D3Node> {
  id: string;
  type: string;
  properties: {
    from: number,
  };
}

export function isD3Node(data: D3Node | D3Relationship): data is D3Node {
  return !!(data as D3Node).labels;
}
