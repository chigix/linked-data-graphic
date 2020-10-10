import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { from, interval, Subject, ConnectableObservable } from 'rxjs';
import { share, take, tap, multicast } from 'rxjs/operators';

import { CodeComponent } from './code.component';

describe('CodeComponent', () => {
  let component: CodeComponent;
  let fixture: ComponentFixture<CodeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CodeComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('test rxjs share', () => {
    const prime = from(Promise.resolve(123)).pipe(share());
    prime.subscribe(n => { console.log('Subscriber#1', n); });
    prime.subscribe(n => { console.log('Subscriber#2', n); });
    const source = interval(1000).pipe(
      take(5), tap(n => console.log('from-tap', n)),
      multicast(new Subject()),
    ) as ConnectableObservable<number>;
    source.subscribe(n => console.log('subscriptor#1', n));
    source.subscribe(n => console.log('subscriptor#2', n));
    source.connect();
  });
});
