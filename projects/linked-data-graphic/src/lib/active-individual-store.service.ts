import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { D3Node, D3Relationship } from './data-interface';

@Injectable()
export class ActiveIndividualStoreService {

  private activeIndividualSubject = new BehaviorSubject<D3Node | D3Relationship>(null);

  /**
   * Active individual$ of active individual cast service
   * shareReplay does two things:
   *  * caches the last emitted value,
   * so components that subscribe after a value been emitted can still display the value,
   *  * shares the same observable between all observables,
   * instead of creating new observables on each subscription
   */
  readonly activeIndividual$ = this.activeIndividualSubject.asObservable().pipe(
    shareReplay(1),
  );

  constructor() { }


  public get activeIndividual(): D3Node | D3Relationship {
    return this.activeIndividualSubject.getValue();
  }


  /**
   * Sets active individual
   * Assigning a value to this.activeIndividualSubject
   * push it onto the observable and down to all of its subscribers
   */
  public set activeIndividual(v: D3Node | D3Relationship) {
    this.activeIndividualSubject.next(v);
  }

  /**
   * clearActiveIndividual
   */
  public clearActiveIndividual(): void {
    this.activeIndividualSubject.next(null);
  }

}
