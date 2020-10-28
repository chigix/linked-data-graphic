import { ErrorHandler, Inject, Injectable, InjectionToken, Optional, ValueProvider } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';

export const SVG_ICONS = new InjectionToken<Array<SvgIconInfo>>('SvgIcons');

export interface SvgIconInfoProvider extends ValueProvider {
  useValue: SvgIconInfo;
}

export interface SvgIconInfo {
  namespace?: string;
  name: string;
  svgSource: string;
}

interface SvgIconMap {
  [namespace: string]: {
    [iconName: string]: SVGElement;
  };
}

const DEFAULT_NS = '$$default';

/**
 * https://github.com/angular/angular/blob/f8096d499324cf0961f092944bbaedd05364eea1/aio/src/app/shared/custom-icon-registry.ts
 */
@Injectable()
export class SvgIconRegistry extends MatIconRegistry {

  private cachedSvgElements: SvgIconMap = { [DEFAULT_NS]: {} };

  constructor(
    http: HttpClient,
    sanitizer: DomSanitizer,
    @Optional() @Inject(DOCUMENT) document: any,
    errorHandler: ErrorHandler,
    @Inject(SVG_ICONS) private svgIcons: SvgIconInfo[],
  ) {
    super(http, sanitizer, document, errorHandler);
  }

  /**
   * getNamedSvgIcon
   */
  public getNamedSvgIcon(iconName: string, namespace?: string): Observable<SVGElement> {
    const nsIconMap = this.cachedSvgElements[namespace || DEFAULT_NS];
    let preloadedElement: SVGElement | undefined = nsIconMap && nsIconMap[iconName];
    if (!preloadedElement) {
      preloadedElement = this.loadSvgElement(iconName, namespace);
    }
    return preloadedElement
      ? of(preloadedElement.cloneNode(true) as SVGElement)
      : super.getNamedSvgIcon(iconName, namespace);

  }

  private loadSvgElement(iconName: string, namespace?: string): SVGElement | undefined {
    const svgIcon = this.svgIcons.find(icon => {
      return namespace
        ? icon.name === iconName && icon.namespace === namespace
        : icon.name === iconName;
    });
    if (!svgIcon) {
      return;
    }

    const ns = svgIcon.namespace || DEFAULT_NS;
    const nsIconMap = this.cachedSvgElements[ns] || (this.cachedSvgElements[ns] = {});

    // Creating a new `<div>` per icon is necessary for the SVGs to work correctly in IE11.
    const div = document.createElement('DIV');

    // SECURITY: the source for the SVG icons is provided in code by trusted developers
    div.innerHTML = svgIcon.svgSource;

    const svgElement = div.querySelector('svg');
    nsIconMap[svgIcon.name] = svgElement;

    return svgElement;
  }
}
