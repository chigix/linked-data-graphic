import { Component } from '@angular/core';
import { ActiveIndividualStoreService } from '../active-individual-store.service';
import { ColorProviderService } from '../color-provider.service';

@Component({
  selector: 'ngld-info-panel',
  templateUrl: './info-panel.component.html',
  styleUrls: ['./info-panel.component.scss']
})
export class InfoPanelComponent {

  constructor(
    public activeIndividualStore: ActiveIndividualStoreService,
    public colorGetter: ColorProviderService,
  ) { }

}
