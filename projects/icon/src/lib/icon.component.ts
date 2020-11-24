import { Attribute, Component, ElementRef, ErrorHandler, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { MatIconLocation, MAT_ICON_LOCATION } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { SvgIconRegistry } from './svg-icon-registry.service';

/** SVG attributes that accept a FuncIRI (e.g. `url(<something>)`). */
const funcIriAttributes = [
  'clip-path',
  'color-profile',
  'src',
  'cursor',
  'fill',
  'filter',
  'marker',
  'marker-start',
  'marker-mid',
  'marker-end',
  'mask',
  'stroke'
];

/** Selector that can be used to find all elements that are using a `FuncIRI`. */
const funcIriAttributeSelector = funcIriAttributes.map(attr => `[${attr}]`).join(', ');

/** Regex that can be used to extract the id out of a FuncIRI. */
const funcIriPattern = /^url\(['"]?#(.*?)['"]?\)$/;

/**
 * ngld-icon component
 * Greatly inspired by @angular/material icon component:
 * https://github.com/angular/components/blob/master/src/material/icon/icon.ts
 */
@Component({
  selector: 'g[ngld-icon]',
  template: '<svg><text> Empty Icon </text></svg>',
})
export class IconComponent implements OnInit, OnChanges, OnDestroy {

  @Input() svgIcon: string;

  private svgName: string | null;
  private svgNamespace: string | null;

  private elementsWithExternalReferences?: Map<Element, { name: string, value: string }[]>;

  /**
   * Subscription to the current in-progress SVG icon request.
   */
  private currentIconFetch = Subscription.EMPTY;

  constructor(
    private elementRef: ElementRef<SVGGElement>,
    private iconRegistry: SvgIconRegistry,
    @Attribute('aria-hidden') ariaHidden: string,
    @Inject(MAT_ICON_LOCATION) private location: MatIconLocation,
    private readonly errorHandler: ErrorHandler,
  ) {
    this.svgIcon = 'expand_node';
    // If the user has not explicitly set aria-hidden, mark the icon as hidden,
    // as this is the right thing to do for the majority of icon use-cases.
    if (!ariaHidden) {
      elementRef.nativeElement.setAttribute('aria-hidden', 'true');
    }
  }

  ngOnInit(): void { }

  /**
   * the value given on svgIcon property is obtained from SimpleChanges event.
   */
  ngOnChanges(changes: SimpleChanges & { svgIcon?: string, previousValue?: string }): void {
    // Only update the inline SVG icon if the inputs changed,
    // to avoid unnecessary DOM operations.

    const svgIconChanges = changes.svgIcon;

    this.svgNamespace = null;
    this.svgName = null;
    if (svgIconChanges) {
      this.currentIconFetch.unsubscribe();
      if (this.svgIcon) {
        const [namespace, iconName] = this.splitIconName(this.svgIcon);
        if (namespace) {
          this.svgNamespace = namespace;
        }
        if (iconName) {
          this.svgName = iconName;
        }

        this.currentIconFetch = this.iconRegistry.getNamedSvgIcon(iconName, namespace)
          .pipe(take(1))
          .subscribe(svg => this.setSvgElement(svg), (err: Error) => {
            const errorMessage = `Error retrieving icon ${namespace}:${iconName} ! ${err.message}`;
            this.errorHandler.handleError(new Error(errorMessage));
          });
      } else if (changes.previousValue) {
        this.clearSvgElement();
      }
    }
    // updateFontIconClasses when usingFontIcon
  }

  ngOnDestroy(): void {
    this.currentIconFetch.unsubscribe();
    if (this.elementsWithExternalReferences) {
      this.elementsWithExternalReferences.clear();
    }
  }

  private splitIconName(iconName: string): [string, string] {
    if (!iconName) {
      return ['', ''];
    }
    const parts = iconName.split(':');
    switch (parts.length) {
      case 1:
        return ['', parts[0]]; // Use default namespace.
      case 2:
        return parts as [string, string];
      default:
        throw Error(`Invalid icon name: "${iconName}"`);
    }
  }

  private setSvgElement(svg: SVGElement): void {
    this.clearSvgElement();
    // Workaround for IE11 and Edge ignoring `style` tags inside dynamically-created SVGs.
    // See: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/10898469/
    // Do this before inserting the element into the DOM,
    // in order to avoid a style recalculation.

    const styleTags = svg.querySelectorAll('style');
    styleTags.forEach(styleTag => styleTag.textContent += ' ');

    // Note: we do this fix here, rather than the icon registry,
    // because the references have to point to the URL at the time
    // that the icon was created.
    const path = this.location.getPathname();
    this.cacheChildrenWithExternalReferences(svg);
    this.elementRef.nativeElement.appendChild(svg);
  }

  private clearSvgElement(): void {
    const layoutElement: SVGGElement = this.elementRef.nativeElement;
    let childCount = layoutElement.childNodes.length;
    if (this.elementsWithExternalReferences) {
      this.elementsWithExternalReferences.clear();
    }

    // Remove existing non-element child nodes and SVGs,
    // and add the new SVG element. Note that we can't use innerHTML,
    // because IE will throw if the element has a data binding.
    // --> I'm not caring IE at present...
    while (childCount--) {
      const child = layoutElement.childNodes[childCount];
      // 1 corresponds to Node.ELEMENT_NODE.
      // We remove all non-element nodes in order to get rid of any loose text nodes,
      // as well as any SVG elements in order to remove any old icons.
      if (child.nodeType !== 1 || child.nodeName.toLowerCase() === 'svg') {
        layoutElement.removeChild(child);
      }
    }
  }

  /**
   * Caches the children of an SVG element that have `url()`
   * references that we need to prefix with the current path.
   */
  private cacheChildrenWithExternalReferences(element: SVGElement): void {
    const elementsWithFuncIri = element.querySelectorAll(funcIriAttributeSelector);
    const elements = this.elementsWithExternalReferences
      = this.elementsWithExternalReferences || new Map();
    elementsWithFuncIri.forEach(elementWithReference => {
      funcIriAttributes.forEach(attr => {
        const value = elementWithReference.getAttribute(attr);
        const match = value ? value.match(funcIriPattern) : null;

        if (match) {
          let attributes = elements.get(elementWithReference);
          if (!attributes) {
            attributes = [];
            elements.set(elementWithReference, attributes);
          }

          attributes.push({ name: attr, value: match[1] });
        }
      });
    });
  }

}
