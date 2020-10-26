export type EasingFunc = (percent: number) => number;
export type RenderState<T> = (percent: number, param: T) => void;
