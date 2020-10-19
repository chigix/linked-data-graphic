import { Directive, ElementRef, OnInit, OnDestroy, HostListener, Output, EventEmitter, Input, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { PanZoomExcludeDirective } from './pan-zoom-exclude.directive';

const activeCapturingEventOptions = normalizePassiveListenerOptions({
  passive: false,
  capture: true,
});

function isTouch(event: MouseEvent | TouchEvent): event is TouchEvent {
  return !!(event as TouchEvent).targetTouches;
}

function getCoordinate(
  event: MouseEvent | TouchEvent,
  clientRect: { left: number, top: number }): { x: number, y: number } {
  if (isTouch(event)) {
    return {
      x: event.targetTouches[0].clientX,
      y: event.targetTouches[1].clientY,
    };
  }
  return {
    x: event.clientX - clientRect.left,
    y: event.clientY - clientRect.top,
  };
}

@Directive({
  selector: '[ngldPanZoom]'
})
export class PanZoomDirective implements OnInit, OnDestroy {

  private pointerOrigin = { x: 0, y: 0 };
  private isPointerDown = false;
  private boundingSize?: { width: number, height: number };
  private previousViewBox ?= {
    minX: 0, minY: 0, width: 500, height: 500,
  };
  private excludeChildrenElements: PanZoomExcludeDirective[] = [];

  @Input() viewBox = {
    minX: 0, minY: 0, width: 500, height: 500,
  };

  @Input() scaleFactor = 1.01;

  @Output() viewBoxChanged = new EventEmitter<{
    minX: number, minY: number, width: number, height: number,
  }>();

  constructor(
    private el: ElementRef<SVGSVGElement>,
    @Inject(DOCUMENT) private document: Document,
  ) { }

  ngOnInit(): void {
    this.document.addEventListener('touchstart', this.pointerDownListener, activeCapturingEventOptions);
    this.document.addEventListener('mousedown', this.pointerDownListener, activeCapturingEventOptions);
    this.document.addEventListener('pointerdown', this.pointerDownListener, activeCapturingEventOptions);

    this.document.addEventListener('touchend', this.pointerUpListener, activeCapturingEventOptions);
    this.document.addEventListener('mouseup', this.pointerUpListener, activeCapturingEventOptions);
    this.document.addEventListener('pointerup', this.pointerUpListener, activeCapturingEventOptions);

    this.document.addEventListener('touchmove', this.pointerMoveListener, activeCapturingEventOptions);
    this.document.addEventListener('mousemove', this.pointerMoveListener, activeCapturingEventOptions);
    this.document.addEventListener('pointermove', this.pointerMoveListener, activeCapturingEventOptions);
  }

  ngOnDestroy(): void {
    this.document.removeEventListener('touchstart', this.pointerDownListener, activeCapturingEventOptions);
    this.document.removeEventListener('mousedown', this.pointerDownListener, activeCapturingEventOptions);
    this.document.removeEventListener('pointerdown', this.pointerDownListener, activeCapturingEventOptions);

    this.document.removeEventListener('touchend', this.pointerUpListener, activeCapturingEventOptions);
    this.document.removeEventListener('mouseup', this.pointerUpListener, activeCapturingEventOptions);
    this.document.removeEventListener('pointerup', this.pointerUpListener, activeCapturingEventOptions);

    this.document.removeEventListener('touchmove', this.pointerMoveListener, activeCapturingEventOptions);
    this.document.removeEventListener('mousemove', this.pointerMoveListener, activeCapturingEventOptions);
    this.document.removeEventListener('pointermove', this.pointerMoveListener, activeCapturingEventOptions);
  }

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

  private pointerDownListener = (event: TouchEvent | MouseEvent) => {
    if (!this.el.nativeElement.contains(event.target as HTMLElement)) {
      return;
    }
    if (this.excludeChildrenElements.find(c => c.checkExclusion(event.target as HTMLElement))) {
      this.isPointerDown = false;
      return;
    }
    this.isPointerDown = true;
    this.pointerOrigin = getCoordinate(event, { top: 0, left: 0 });
    this.previousViewBox = { ...this.viewBox };
    this.boundingSize = undefined;
  }

  private pointerUpListener = (event: TouchEvent | MouseEvent) => {
    this.isPointerDown = false;
    this.previousViewBox = undefined;
  }

  private pointerMoveListener = (event: TouchEvent | MouseEvent) => {
    if (!this.isPointerDown) {
      return;
    }
    if (!this.boundingSize) {
      this.boundingSize = this.el.nativeElement.getBoundingClientRect();
    }
    // Prevent user to do a selection on the page
    event.preventDefault();

    // Get the current pointer position
    const pointerPosition = getCoordinate(event, { top: 0, left: 0 });
    const ratio = this.previousViewBox.width / this.boundingSize.width;

    const newViewBox = {
      minX: this.previousViewBox.minX - ((pointerPosition.x - this.pointerOrigin.x) * ratio),
      minY: this.previousViewBox.minY - ((pointerPosition.y - this.pointerOrigin.y) * ratio)
    };

    this.viewBoxChanged.emit({ ...this.viewBox, ...newViewBox });
  }

  @HostListener('wheel', ['$event'])
  onZoom(e: WheelEvent): void {
    e.preventDefault();
    const position = getCoordinate(e, this.el.nativeElement.getBoundingClientRect());
    const scale = Math.pow(this.scaleFactor, e.deltaY < 0 ? 1 : -1);
    const sx = position.x / this.el.nativeElement.clientWidth;
    const sy = position.y / this.el.nativeElement.clientHeight;

    const x = this.viewBox.minX + this.viewBox.width * sx;
    const y = this.viewBox.minY + this.viewBox.height * sy;
    this.viewBoxChanged.emit({
      minX: x + scale * (this.viewBox.minX - x),
      minY: y + scale * (this.viewBox.minY - y),
      width: this.viewBox.width * scale,
      height: this.viewBox.height * scale,
    });
  }

}
