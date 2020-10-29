import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PanZoomDirectiveModule } from '@ngld/pan-zoom';
import { SvgIconModule } from '@ngld/icon';
import { LinkedDataGraphicComponent } from './linked-data-graphic.component';
import { BoxSizeListenerDirective } from './box-size-listener.directive';
import { LongPressDirective } from './long-press.directive';
import { InfoPanelComponent } from './info-panel-component/info-panel.component';

@NgModule({
  declarations: [
    LinkedDataGraphicComponent,
    BoxSizeListenerDirective,
    LongPressDirective,
    InfoPanelComponent],
  imports: [
    BrowserModule, DragDropModule, PanZoomDirectiveModule,
    SvgIconModule
  ],
  exports: [LinkedDataGraphicComponent, InfoPanelComponent]
})
export class LinkedDataGraphicModule { }
