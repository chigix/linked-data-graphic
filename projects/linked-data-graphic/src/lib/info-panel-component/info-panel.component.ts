import { Component } from '@angular/core';
import { ActiveIndividualCastService } from '../active-individual-cast.service';
import { ColorProviderService } from '../color-provider.service';

@Component({
  selector: 'ngld-info-panel',
  templateUrl: './info-panel.component.html',
  styleUrls: ['./info-panel.component.scss']
})
export class InfoPanelComponent {

  constructor(
    public activeIndividual: ActiveIndividualCastService,
    public colorGetter: ColorProviderService,
  ) { }

}
