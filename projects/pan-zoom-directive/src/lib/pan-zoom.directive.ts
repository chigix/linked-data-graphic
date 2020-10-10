import { Directive, ElementRef, OnInit, HostListener } from '@angular/core';

@Directive({
  selector: '[ngldPanZoom]'
})
export class PanZoomDirective implements OnInit {

  constructor(
    private el: ElementRef<SVGSVGElement>,
  ) { }

  ngOnInit(): void {
    console.log('PanZoomDirective works');
  }

  @HostListener('touchstart', ['$event'])
  @HostListener('mousedown', ['$event'])
  onDownHandleCanvasG(e: MouseEvent): void {
    console.log('onDownHandleLdCanvas');
  }

  @HostListener('touchend')
  @HostListener('mouseup')
  @HostListener('mouseleave')
  onMoveHandleCanvasG(e: MouseEvent): void {
    console.log('onMoveHandleLdCanvas');
  }

}
