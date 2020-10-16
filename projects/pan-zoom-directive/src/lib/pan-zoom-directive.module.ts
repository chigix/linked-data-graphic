import { NgModule } from '@angular/core';
import { PanZoomDirective } from './pan-zoom.directive';
import { PanZoomExcludeDirective } from './pan-zoom-exclude.directive';



@NgModule({
  declarations: [PanZoomDirective, PanZoomExcludeDirective],
  imports: [],
  exports: [PanZoomDirective, PanZoomExcludeDirective]
})
export class PanZoomDirectiveModule { }
