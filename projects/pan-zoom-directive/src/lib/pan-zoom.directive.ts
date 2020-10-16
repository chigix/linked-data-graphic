import { Directive, ElementRef, OnInit, HostListener, Output, EventEmitter, Input } from '@angular/core';
import { PanZoomExcludeDirective } from './pan-zoom-exclude.directive';

function isTouch(event: MouseEvent | TouchEvent): event is TouchEvent {
  return !!(event as TouchEvent).targetTouches;
}

function getCoordinate(event: MouseEvent | TouchEvent): { x: number, y: number } {
  if (isTouch(event)) {
    return {
      x: event.targetTouches[0].clientX,
      y: event.targetTouches[1].clientY,
    };
  }
  return {
    x: event.clientX,
    y: event.clientY,
  };
}

@Directive({
  selector: '[ngldPanZoom]'
})
export class PanZoomDirective implements OnInit {

  private pointerOrigin = { x: 0, y: 0 };
  private isPointerDown = false;
  private boundingSize?: { width: number, height: number };
  private previousViewBox?= {
    minX: 0, minY: 0, width: 500, height: 500,
  };
  private excludeChildrenElements: PanZoomExcludeDirective[] = [];

  @Input() viewBox = {
    minX: 0, minY: 0, width: 500, height: 500,
  };
  private newViewBox = { minX: 0, minY: 0 };

  @Output() viewBoxChanged = new EventEmitter<{
    minX: number, minY: number, width: number, height: number,
  }>();

  constructor(
    private el: ElementRef<SVGSVGElement>,
  ) { }

  ngOnInit(): void { }

  /**
   * excludeChild
   */
  public excludeChild(component: PanZoomExcludeDirective): void {
    this.excludeChildrenElements.push(component);
  }

  /**
   * onExcludeDestroyed
   */
  public onExcludeDestroyed(component: PanZoomExcludeDirective): void {
    this.excludeChildrenElements = this.excludeChildrenElements
      .filter(c => c !== component);
  }

  @HostListener('touchstart', ['$event', '$event.target'])
  @HostListener('mousedown', ['$event', '$event.target'])
  @HostListener('pointerdown', ['$event', '$event.target'])
  onPointerDown(e: MouseEvent, targetElement: HTMLElement): void {
    if (this.excludeChildrenElements.find(c => c.checkExclusion(targetElement))) {
      this.isPointerDown = false;
      return;
    }
    this.isPointerDown = true;
    this.pointerOrigin = getCoordinate(e);
    this.previousViewBox = { ...this.viewBox };
    this.boundingSize = undefined;
  }

  @HostListener('touchend', ['$event'])
  @HostListener('mouseup', ['$event'])
  @HostListener('mouseleave', ['$event'])
  @HostListener('pointerup', ['$event'])
  @HostListener('pointerleave', ['$event'])
  onPointerUp(e: MouseEvent): void {
    this.isPointerDown = false;
    this.previousViewBox = undefined;
  }

  @HostListener('touchmove', ['$event'])
  @HostListener('mousemove', ['$event'])
  @HostListener('pointermove', ['$event'])
  onPointerMove(e: MouseEvent): void {
    if (!this.isPointerDown) {
      return;
    }
    if (!this.boundingSize) {
      this.boundingSize = this.el.nativeElement.getBoundingClientRect();
    }
    // Prevent user to do a selection on the page
    e.preventDefault();

    // Get the current pointer position
    const pointerPosition = getCoordinate(e);
    const ratio = this.previousViewBox.width / this.boundingSize.width;

    this.newViewBox.minX = this.previousViewBox.minX - ((pointerPosition.x - this.pointerOrigin.x) * ratio);
    this.newViewBox.minY = this.previousViewBox.minY - ((pointerPosition.y - this.pointerOrigin.y) * ratio);

    this.viewBoxChanged.emit({ ...this.viewBox, ...this.newViewBox });
  }

}
