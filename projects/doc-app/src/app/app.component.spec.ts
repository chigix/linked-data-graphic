import { TestBed, waitForAsync } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { NavigationComponent } from './modules/navigation/navigation.component';
import { LinkedDataGraphicModule } from 'linked-data-graphic';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'quickstart', component: HomeComponent },
];

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        // RouterTestingModule
        RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
        NoopAnimationsModule,
        MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule,
        MatListModule,
        LinkedDataGraphicModule,
      ],
      declarations: [
        AppComponent,
        HomeComponent,
        NavigationComponent,
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'linked-data-graphic'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance as AppComponent;
    expect(app.title).toEqual('linked-data-graphic');
  });

  it('should render title in a h1 tag', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1').textContent).toContain('Linked Data Graphic Component');
  });
});
