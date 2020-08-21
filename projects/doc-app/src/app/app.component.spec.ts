import { TestBed, async } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Routes, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { NavigationComponent } from './modules/navigation/navigation.component';
import { LinkedDataGraphicModule } from 'linked-data-graphic';
import {
  MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule,
  MatListModule,
} from '@angular/material';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'quickstart', component: HomeComponent },
];

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        // RouterTestingModule
        RouterModule.forRoot(routes), NoopAnimationsModule,
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
