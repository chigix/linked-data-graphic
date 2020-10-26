import { Injectable } from '@angular/core';
import { Trigger } from './trigger.class';

@Injectable()
export class TransitionService {

  constructor(
    public triggers: Trigger[],
  ) { }

  /**
   * animate
   */
  public async animate(triggerName: string, from: string, to: string, param: any): Promise<any> {
    const trigger = this.triggers.find(trig => trig.name === triggerName);
    if (!trigger) {
      console.warn(`Trigger ${triggerName} is not defined.`);
      return;
    }
    const transition = trigger.transitions.find(trans => trans.validate(from, to));
    if (!transition) {
      console.warn(`Transition ${from} => ${to} is not defined`);
      return;
    }
    if (!requestAnimationFrame) {
      // requestAnimationFrame API is not available in current browser.
      // https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
      transition.steps.forEach(step => step(1, param));
      return;
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
