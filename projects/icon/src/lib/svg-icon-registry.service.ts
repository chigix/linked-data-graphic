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

/**
 * An exception to be thrown when the consumer attempts to use `<ngld-icon>`
 * without including @angular/common/http.
 */
export class SvgIconNoHttpProviderError extends Error {

  constructor() {
    super('Could not find HttpClient provider for use with Angular Material icons.'
      + 'Please include the HttpClientModule from @angular/common/http in your '
      + 'app imports.');
  }
}

const DEFAULT_NS = '$$default';

/**
 * https://github.com/angular/angular/blob/f8096d499324cf0961f092944bbaedd05364eea1/aio/src/app/shared/custom-icon-registry.ts
 */
@Injectable({ providedIn: 'root' })
export class SvgIconRegistry extends MatIconRegistry {

  private cachedSvgElements: SvgIconMap = { [DEFAULT_NS]: {} };

  constructor(
    @Optional() private http: HttpClient,
    sanitizer: DomSanitizer,
    @Optional() @Inject(DOCUMENT) document: any,
    errorHandler: ErrorHandler,
    @Optional() @Inject(SVG_ICONS) private svgIcons: SvgIconInfo[],
  ) {
    super(http, sanitizer, document, errorHandler);
    if (svgIcons == null) {
      this.svgIcons = [];
    }
  }

  /**
   * Returns an Observable that produces the icon (as an `<svg>` DOM element)
   * with the given name and namespace.
   * The icon must have been previously registered with addIcon or addIconSet;
   * if not, the observable will throw an error.
   */
  public getNamedSvgIcon(iconName: string, namespace?: string): Observable<SVGElement> {
    if (!this.http) {
      throw new SvgIconNoHttpProviderError();
    }
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
