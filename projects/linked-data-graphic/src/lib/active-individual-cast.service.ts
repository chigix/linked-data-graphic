import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { D3Node, D3Relationship } from './data-interface';

@Injectable()
export class ActiveIndividualCastService {

  private $activeIndividual = new BehaviorSubject<D3Node | D3Relationship>(null);

  constructor() { }

  /**
   * updateActiveIndividual
   */
  public updateActiveIndividual(data: D3Node | D3Relationship): void {
    this.$activeIndividual.next(data);
  }

  /**
   * clearActiveIndividual
   */
  public clearActiveIndividual(): void {
    this.$activeIndividual.next(null);
  }

  /**
   * observeActiveIndividual
   */
  public observeActiveIndividual(): Observable<D3Node | D3Relationship | null> {
    return this.$activeIndividual.asObservable();
  }

}
