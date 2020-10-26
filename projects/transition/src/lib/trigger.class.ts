import { Transition } from './transition.class';

export class Trigger {

  public transitions: Transition[] = [];

  constructor(
    public name: string) {
  }
}
