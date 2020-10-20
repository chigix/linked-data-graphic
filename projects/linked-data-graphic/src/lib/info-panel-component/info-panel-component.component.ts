import { Component } from '@angular/core';
import { ActiveIndividualCastService } from '../active-individual-cast.service';
import { ColorGetter, ColorProviderService } from '../color-provider.service';

@Component({
  selector: 'ngld-info-panel',
  templateUrl: './info-panel-component.component.html',
  styleUrls: ['./info-panel-component.component.scss']
})
export class InfoPanelComponentComponent {

  public colorGetter: ColorGetter;

  constructor(
    public activeIndividual: ActiveIndividualCastService,
    private colorProvider: ColorProviderService<InfoPanelComponentComponent>,
  ) {
    this.colorGetter = this.colorProvider.registerComponent(this);
  }

}
