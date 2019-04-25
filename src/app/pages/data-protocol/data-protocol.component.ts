import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-data-protocol',
  templateUrl: './data-protocol.component.html',
})
export class DataProtocolComponent implements OnInit {

  codes = {
    nodeStructure: `
    {
      // the node's index used as node id for searching node in building
      // links
      index: string,
      x: number,
      y: number,
      vx: number,
      vy: number,
    }`,
    linkStructure: `
    {
      // the node's index used as node id for searching node in building
      // links
      index: string,
      // The link's source node
      source: number,
      // The link's target node
      target: number,
    }`,
  };

  constructor() { }

  ngOnInit() {
  }

}
