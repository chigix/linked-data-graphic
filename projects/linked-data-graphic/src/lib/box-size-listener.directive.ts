import { Directive, ElementRef, Input, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[ngldBoxSizeListener]'
})
export class BoxSizeListenerDirective {

  constructor(
    private el: ElementRef) { }

  @Input() set listenValue(a: any) {
    this.boxSize.emit(this.el.nativeElement.getBBox());
  }

  @Output() boxSize = new EventEmitter<{ width: number, height: number }>();

}
