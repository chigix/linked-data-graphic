import { Transition } from './transition.class';
import { RenderState, EasingFunc } from './types';
import { Trigger } from './trigger.class';

type AnimationMetadata = (trig: Trigger) => void;
type TransitionMetadata = (transition: Transition) => void;

export function trigger(name: string, definition: AnimationMetadata[]): Trigger {
  const result = new Trigger(name);
  definition.forEach(def => def(result));
  return result;
}

export function transition(
  stateChangeExpr: ((fromtState: string, toState: string) => boolean),
  steps: TransitionMetadata[]): AnimationMetadata {
  const transResult = new Transition(stateChangeExpr);
  steps.forEach(stepDef => stepDef(transResult));
  return (trig: Trigger) => {
    trig.transitions.push(transResult);
  };
}

export function render<T>(state: RenderState<T>): TransitionMetadata {
  return (trans: Transition) => {
    trans.steps.push(state);
  };
}

export function animate(duration: number, easing: EasingFunc): TransitionMetadata {
  return (trans: Transition) => {
    trans.duration = duration;
    trans.easing = easing;
  };
}
