import { Component } from '@angular/core';
import { ActiveIndividualCastService } from '../active-individual-cast.service';
import { ColorProviderService } from '../color-provider.service';

@Component({
  selector: 'ngld-info-panel',
  templateUrl: './info-panel-component.component.html',
  styleUrls: ['./info-panel-component.component.scss']
})
export class InfoPanelComponentComponent {

  constructor(
    public activeIndividual: ActiveIndividualCastService,
    private colorGetter: ColorProviderService,
  ) { }

}
