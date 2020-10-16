import { Directive, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { PanZoomDirective } from './pan-zoom.directive';

@Directive({
  selector: '[ngldPanZoomExclude]'
})
export class PanZoomExcludeDirective implements OnInit, OnDestroy {

  constructor(
    private el: ElementRef<SVGSVGElement>,
    private parentCanvas: PanZoomDirective,
  ) { }

  /**
   * checkExclusion
   */
  public checkExclusion(target: HTMLElement): boolean {
    return this.el.nativeElement.contains(target);
  }

  ngOnDestroy(): void {
    this.parentCanvas.onExcludeDestroyed(this);
  }

  ngOnInit(): void {
    this.parentCanvas.excludeChild(this);
  }

}
