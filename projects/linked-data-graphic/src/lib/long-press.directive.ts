import {
  Directive,
  Output,
  EventEmitter,
  HostBinding,
  HostListener
} from '@angular/core';

@Directive({
  selector: '[chigixLongPress]'
})
export class LongPressDirective {
  private isPressing: boolean;
  private isLongPressing: boolean;
  timeout: number;
  interval: number;

  @Output() longPress = new EventEmitter();

  @Output() longPressing = new EventEmitter();

  @HostBinding('class.press')
  get clsPress(): boolean { return this.isPressing; }

  @HostBinding('class.longpress')
  get clsLongPress(): boolean { return this.isLongPressing; }

  @HostListener('touchstart', ['$event'])
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.isPressing = true;
    this.isLongPressing = false;
    this.timeout = setTimeout(() => {
      this.isLongPressing = true;
      this.longPress.emit(event);
      this.interval = setInterval(() => {
        this.longPressing.emit(event);
      }, 50);
    }, 500);
  }

  @HostListener('touchend')
  @HostListener('mouseup')
  @HostListener('mouseleave')
  endPress(): void {
    clearTimeout(this.timeout);
    clearInterval(this.interval);
    this.isLongPressing = false;
    this.isPressing = false;
  }
}
