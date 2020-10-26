/**
 * No easing, no acceleration
 */
export function linear(t: number): number {
  return t;
}

/**
 * Accelerating from zero velocity
 */
export function easeInQuad(t: number): number {
  return t * t;
}

/**
 * Decelerating to zero velocity
 */
export function easeOutQuad(t: number): number {
  return t * (2 - t);
}

/**
 * Acceleration until halfway, then deceleration
 */
export function easeInOutQuad(t: number): number {
  return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Accelerating from zero velocity
 */
export function easeInCubic(t: number): number {
  return t * t * t;
}

/**
 * Decelerating to zero velocity
 */
export function easeOutCubic(t: number): number {
  return (--t) * t * t + 1;
}

/**
 * Acceleration until halfway, then deceleration
 */
export function easeInOutCubic(t: number): number {
  return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

/**
 * Accelerating from zero velocity
 */
export function easeInQuart(t: number): number {
  return t * t * t * t;
}

/**
 * Decelerating to zero velocity
 */
export function easeOutQuart(t: number): number {
  return 1 - (--t) * t * t * t;
}

/**
 * Acceleration until halfway, then deceleration
 */
export function easeInOutQuart(t: number): number {
  return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
}

/**
 * Accelerating from zero velocity
 */
export function easeInQuint(t: number): number {
  return t * t * t * t * t;
}

/**
 * Decelerating to zero velocity
 */
export function easeOutQuint(t: number): number {
  return 1 + (--t) * t * t * t * t;
}

/**
 * Acceleration until halfway, then deceleration
 */
export function easeInOutQuint(t: number): number {
  return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
}
