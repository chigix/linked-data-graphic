import { Injectable } from '@angular/core';
import { COLORS } from './utils';

export abstract class ColorProviderService {
  abstract nextColor(): string;
  abstract nextColorByName(name: string): string;
}

@Injectable()
export class DefaultColorProviderService extends ColorProviderService {

  private classes2colors: { [key: string]: string } = {};

  constructor() {
    super();
  }

  nextColor(): string {
    return '#68bdf6';
  }
  nextColorByName(name: string): string {
    const color = this.classes2colors[name];
    if (color) {
      return color;
    }
    this.classes2colors[name] = COLORS[
      Object.keys(this.classes2colors).length % COLORS.length
    ];
    return this.classes2colors[name];
  }

}
