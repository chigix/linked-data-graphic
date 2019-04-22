import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { LinkedDataGraphic, D3Data } from './chart-generator';

@Component({
  selector: 'chigix-ld-graphic',
  template: `
    <div>
      <div>
        <svg #mainCanvas class="neo4jd3-graph" width="1200px" height="400px"></svg>
        <div #infoPanel class="neo4jd3-info"></div>
      </div>
    </div>
  `,
  styleUrls: ['./component.scss']
})
export class LinkedDataGraphicComponent implements OnInit {

  @ViewChild('mainCanvas')
  mainCanvas: ElementRef<SVGSVGElement>;

  @ViewChild('infoPanel')
  infoPanel: ElementRef<HTMLDivElement>;

  @Input() private data: D3Data;

  constructor() { }

  async ngOnInit() {
    const graph = await LinkedDataGraphic(
      this.mainCanvas.nativeElement,
      this.infoPanel.nativeElement,
      {
        // highlight: (d) => false,
        minCollision: 60,
        nodeRadius: 25,
        zoomFit: false,
      },
      {},
    );
    if (this.data) {
      graph.updateData(this.data);
    }
  }

}
