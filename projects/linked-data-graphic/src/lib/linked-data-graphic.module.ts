import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LinkedDataGraphicComponent } from './linked-data-graphic.component';
import { BoxSizeListenerDirective } from './box-size-listener.directive';
import { LongPressDirective } from './long-press.directive';

@NgModule({
  declarations: [
    LinkedDataGraphicComponent,
    BoxSizeListenerDirective,
    LongPressDirective],
  imports: [
    BrowserModule, DragDropModule,
  ],
  exports: [LinkedDataGraphicComponent]
})
export class LinkedDataGraphicModule { }
