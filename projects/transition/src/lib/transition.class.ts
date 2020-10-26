import { EasingFunc, RenderState } from './types';

export class Transition {

  public steps: RenderState<any>[] = [];
  public duration = 1;
  public easing: EasingFunc = () => null;

  constructor(
    public validate: ((fromtState: string, toState: string) => boolean),
  ) { }
}
