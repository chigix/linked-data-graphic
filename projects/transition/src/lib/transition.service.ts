import { Injectable, Optional } from '@angular/core';
import { Trigger } from './trigger.class';

export class InvalidTriggerRegisterError extends Error {

  constructor() {
    super('Could not find triggers registered in the transition.');
  }
}

@Injectable()
export class TransitionService {

  constructor(
    @Optional() public triggers: Trigger[],
  ) { }

  /**
   * animate
   */
  public async animate(triggerName: string, from: string, to: string, param: any): Promise<any> {
    if (!Array.isArray(this.triggers)) {
      return Promise.reject(new InvalidTriggerRegisterError());
    }
    const trigger = this.triggers.find(trig => trig.name === triggerName);
    if (!trigger) {
      console.warn(`Trigger ${triggerName} is not defined.`);
      return Promise.resolve();
    }
    const transition = trigger.transitions.find(trans => trans.validate(from, to));
    if (!transition) {
      console.warn(`Transition ${from} => ${to} is not defined`);
      return Promise.resolve();
    }
    if (!requestAnimationFrame) {
      // requestAnimationFrame API is not available in current browser.
      // https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
      transition.steps.forEach(step => step(1, param));
      return Promise.resolve();
    }
    return Promise.all(transition.steps.map(render => new Promise((resolve) => {
      const start = Date.now();
      (function loop(): void {
        const p = (Date.now() - start) / transition.duration;
        if (p > 1) {
          render(1, param);
          resolve(render);
        } else {
          requestAnimationFrame(loop);
          render(transition.easing(p), param);
        }
      })();
    })));
  }
}
