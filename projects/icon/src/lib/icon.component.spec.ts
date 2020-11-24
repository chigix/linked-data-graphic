import { inject, waitForAsync, fakeAsync, tick, TestBed } from '@angular/core/testing';
import { SafeResourceUrl, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { Component, ErrorHandler, ViewChild } from '@angular/core';
import { FAKE_SVGS } from '@test/examples/fake-svgs';
import { SvgIconModule } from './svg-icon.module';
import { SvgIconRegistry, SvgIconInfoProvider, SVG_ICONS } from './svg-icon-registry.service';
import { SvgIconNoHttpProviderError } from './svg-icon-registry.service';
import { IconComponent } from './icon.component';

function fakeIconProvider(name: string, svgSource: string): SvgIconInfoProvider {
  return {
    provide: SVG_ICONS,
    useValue: { name, svgSource },
    multi: true,
  };
}

/**
 * Returns the CSS classes assigned to an element as a sorted array.
 */
function sortedClassNames(element: Element): string[] {
  return element.className.split(' ').sort();
}

/**
 * Verifys that an element contains a single `svg` child element,
 * and returns that child.
 */
function verifyAndGetSingleSvgChild(element: SVGElement): SVGElement {
  expect(element.id).toBeFalsy();
  expect(element.childNodes.length).toBe(1);
  const svgChild = element.childNodes[0] as SVGElement;
  expect(svgChild.tagName.toLowerCase()).toBe('svg');
  return svgChild;
}

/**
 * Verifies that an element contains a single `<path>` child element whose "id"
 * attribute has the specified value.
 */
function verifyPathChildElement(element: Element, attributeValue: string): void {
  expect(element.childNodes.length).toBe(1);
  const pathElement = element.childNodes[0] as SVGPathElement;
  expect(pathElement.tagName.toLowerCase()).toBe('path');

  // The testing data SVGs have the name attribute set for verification.
  expect(pathElement.getAttribute('name')).toBe(attributeValue);
}

describe('ngld-icon', () => {
  let fakePath: string;
  let errorHandler: jasmine.SpyObj<ErrorHandler>;

  beforeEach(waitForAsync(() => {
    // The $ prefix tells Karma not to try to process the request
    // so that we don't get warnings in our logs.
    fakePath = '$fake-path';
    errorHandler = jasmine.createSpyObj('errorHandler', ['handlerError']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SvgIconModule],
      declarations: [
        IconWithLigatureComponent, IconFromSvgNameComponent, BlankIconComponent,
      ],
    });

    TestBed.compileComponents();
  }));

  let iconRegistry: SvgIconRegistry;
  let http: HttpTestingController;
  let sanitizer: DomSanitizer;

  beforeEach(inject([SvgIconRegistry, HttpTestingController, DomSanitizer],
    (r: SvgIconRegistry, h: HttpTestingController, ds: DomSanitizer) => {
      iconRegistry = r;
      http = h;
      sanitizer = ds;
    })
  );

  it('should mark ngld-icon as aria-hidden by default', () => {
    const fixture = TestBed.createComponent(IconWithLigatureComponent);

    const iconElement = fixture.debugElement.nativeElement.querySelector('[ngld-icon]');

    expect(iconElement.getAttribute('aria-hidden'))
      .toBe('true', 'Expected the mat-icon element has aria-hidden="true" by default');
  });

  it('should handle assigning an icon through the setter', fakeAsync(() => {
    iconRegistry.addSvgIconLiteral('fido', trustHtml(FAKE_SVGS.dog));

    const fixture = TestBed.createComponent(BlankIconComponent);
    fixture.detectChanges();
    let svgElement: SVGElement;
    const testComponent = fixture.componentInstance;
    const iconElement = fixture.debugElement.nativeElement.querySelector('[ngld-icon]');

    testComponent.icon.svgIcon = 'fido';
    fixture.detectChanges();
    svgElement = verifyAndGetSingleSvgChild(iconElement);
    console.log('before verification');
    console.log(svgElement);
    verifyPathChildElement(svgElement, 'woof');
    tick();
  }));

  /** Marks an SVG icon string as explicitly trusted. */
  function trustHtml(iconHtml: string): SafeHtml {
    return sanitizer.bypassSecurityTrustHtml(iconHtml);
  }

});

describe('ngld-icon with preloaded svgs', () => {
  let iconRegistry: SvgIconRegistry;
  let sanitizer: DomSanitizer;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SvgIconModule],
      providers: [fakeIconProvider('fido', FAKE_SVGS.dog)],
      declarations: [IconFromSvgNameComponent],
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([SvgIconRegistry, DomSanitizer],
    (sir, san) => {
      iconRegistry = sir;
      sanitizer = san;
    }));

  it('should handle assigning an icon through angular inject', fakeAsync(() => {
    const fixture = TestBed.createComponent(IconFromSvgNameComponent);
    fixture.detectChanges();
    let svgElement: SVGElement;
    const testComponent = fixture.componentInstance;
    const iconElement = fixture.debugElement.nativeElement.querySelector('g[ngld-icon]');

    testComponent.iconName = 'fido';
    fixture.detectChanges();
    svgElement = verifyAndGetSingleSvgChild(iconElement);
    verifyPathChildElement(svgElement, 'woof');
    tick();
  }));
});

describe('ngld-icon without HttpClientModule', () => {
  let iconRegistry: SvgIconRegistry;
  let sanitizer: DomSanitizer;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SvgIconModule],
      declarations: [IconFromSvgNameComponent],
    });

    TestBed.compileComponents();
  }));


  beforeEach(inject([SvgIconRegistry, DomSanitizer],
    (sir: SvgIconRegistry, ds: DomSanitizer) => {
      iconRegistry = sir;
      sanitizer = ds;
    })
  );

  it('should through an error when trying to load a remote icon', () => {
    expect(() => {
      iconRegistry.addSvgIcon('fido', sanitizer.bypassSecurityTrustResourceUrl('dog.svg'));

      const fixture = TestBed.createComponent(IconFromSvgNameComponent);

      fixture.componentInstance.iconName = 'fido';
      fixture.detectChanges();
    }).toThrowError(SvgIconNoHttpProviderError);
  });

});

@Component({ template: '<g ngld-icon>{{ iconName }}</g>' })
class IconWithLigatureComponent {
  iconName = '';
}

@Component({ template: '<g ngld-icon [svgIcon]="iconName"></g>' })
class IconFromSvgNameComponent {
  iconName: string | undefined = '';
}

@Component({ template: `<g ngld-icon></g>` })
class BlankIconComponent {
  @ViewChild(IconComponent) icon: IconComponent;
}
