import { Component, ViewChild } from '@angular/core';
import {
  LinkedDataGraphicComponent, SimpleGraph,
  ColorProviderService, DefaultColorProviderService,
  ActiveIndividualStoreService,
} from '@ngld/canvas';
import { SimulationNodeDatum } from 'd3-force';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  providers: [
    { provide: ColorProviderService, useClass: DefaultColorProviderService },
    ActiveIndividualStoreService],
})
export class HomeComponent {

  @ViewChild(LinkedDataGraphicComponent)
  ldCanvas: LinkedDataGraphicComponent;

  $states = {
    ldData: {
      editMode: false,
    },
  };

  ldData: SimpleGraph = {
    nodes: [
      { labels: ['8階へ戻る'], id: '1', properties: {} },
      { labels: ['8階から悲鳴が聞こえた'], id: '2', properties: {} },
      { labels: ['中鉢博士の発表会見に来る'], id: '3', properties: {} },
      { labels: ['牧瀬紅莉栖に声掛けられる'], id: '4', properties: {} },
      { labels: ['7階へ行く'], id: '5', properties: {} },
      { labels: ['まゆりの所へ見に行く'], id: '6', properties: {} },
      { labels: ['まゆりはメタルうーぱを落としたみたい'], id: '7', properties: {} },
      { labels: ['牧瀬紅莉栖が刺された観測'], id: '8', properties: {} },
    ],
    relationships: [
      { id: '21', type: 'for', source: '1', target: '2', properties: { from: 1 } },
      { id: '31', type: 'includedIn', source: '3', target: '4', properties: { from: 1 } },
      { id: '32', type: 'includedIn', source: '4', target: '1', properties: { from: 1 } },
      { id: '33', type: 'includedIn', source: '3', target: '1', properties: { from: 1 } },
      { id: '34', type: 'includedIn', source: '3', target: '5', properties: { from: 1 } },
      { id: '41', type: 'for', source: '5', target: '6', properties: { from: 1 } },
      { id: '42', type: 'for', source: '6', target: '7', properties: { from: 1 } },
      { id: '43', type: 'for', source: '5', target: '7', properties: { from: 1 } },
      { id: '44', type: 'includedIn', source: '3', target: '6', properties: { from: 1 } },
    ],
  };

  thorinAndCompany = {
    nodes: [
      { labels: ['The Hall at Bag-End'], id: '1' },
      { labels: ['The Misty Mountains'], id: '2' },
      { labels: ['Wilderland'], id: '3' },
      { labels: ['Lonely Mountain'], id: '4' },
    ],
    relationships: [
      { id: '21', type: 'through', source: '1', target: '2' },
      { id: '22', type: 'through', source: '2', target: '3' },
      { id: '23', type: 'through', source: '3', target: '4' },
    ],
  };

  codes = {
    installInTs: `
    import { LinkedDataGraphicModule } from '@ngld/canvas';
    ...
    imports: [
      ...
      LinkedDataGraphicModule,
      ...
    ]`,
    bindingProperty: `
    export class AppComponent implements OnInit {
      ...
      // Define the property for binding
      thorinAndCompany = {
        nodes: [
          { labels: ['The Hall at Bag-End'], id: '1' },
          { labels: ['The Misty Mountains'], id: '2' },
          { labels: ['Wilderland'], id: '3' },
          { labels: ['Lonely Mountain'], id: '4' },
        ],
        relationships: [
          { id: '21', type: 'through', source: '1', target: '2' },
          { id: '22', type: 'through', source: '2', target: '3' },
          { id: '23', type: 'through', source: '3', target: '4' },
        ],
      };`,
    componentUsageHtml: `<ngld-canvas [graph]="thorinAndCompany"></ngld-canvas>`,
  };

  thorinAndCompanyHighlighter(node: SimulationNodeDatum): boolean {
    return true;
  }
  constructor() { }

}
