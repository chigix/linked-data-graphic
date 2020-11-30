import { Injectable } from '@angular/core';
import { waitForAsync, TestBed } from '@angular/core/testing';

import { TransitionService, InvalidTriggerRegisterError } from './transition.service';

describe('TransitionService', () => {
  let transitionService: TransitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{
        provide: TransitionService,
        useClass: EmptyAnimation,
      }],
    });
    transitionService = TestBed.inject(TransitionService);
  });

  it('should be created', () => {
    expect(transitionService).toBeTruthy();
  });

});

describe('TransitionService with predefined animation triggers', () => {
  it('should be defined', () => { });
});

describe('TransitionService without Triggers', () => {
  it('should throw an error', waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [TransitionService],
    });
    const transition = TestBed.inject(TransitionService);

    expectAsync(transition.animate('openClose', 'open', 'void', null))
      .toBeRejectedWithError(InvalidTriggerRegisterError);
  }));
});

@Injectable()
class EmptyAnimation extends TransitionService {
  constructor() {
    super([]);
  }
}

// @TODO
// const PredefinedAnimation = new TransitionService([
// ]);
