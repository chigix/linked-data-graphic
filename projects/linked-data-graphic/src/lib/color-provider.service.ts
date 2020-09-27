import { Injectable } from '@angular/core';
import { COLORS } from './utils';

export interface ColorGetter {
  nextColor(): string;
  nextColorByName(name: string): string;

}

export abstract class ColorProviderService<C> {
  abstract registerComponent(compo: C): ColorGetter;

}

@Injectable()
export class DefaultColorProviderService<C> extends ColorProviderService<C> {

  constructor() {
    super();
  }

  registerComponent(compo: C): ColorGetter {
    const classes2colors: { [key: string]: string } = {};
    return {
      nextColor: () => '#68bdf6',
      nextColorByName: (name: string) => {
        const color = classes2colors[name];
        if (color) {
          return color;
        }
        classes2colors[name] = COLORS[
          Object.keys(classes2colors).length % COLORS.length
        ];
        return classes2colors[name];
      },
    };
  }

}
