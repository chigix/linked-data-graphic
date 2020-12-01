import * as easing from './easing.function';

function identity(x: number): number {
  return x;
}

function assertClose(a: number, b: number, precision = 0.00001): void {
  expect(Math.abs(a - b)).toBeLessThanOrEqual(precision);
}

function makeAssertCloseWithPrecisioin(precision: number)
  : (a: number, b: number) => void {
  return (a: number, b: number) => {
    assertClose(a, b, precision);
  };
}

function allEquals(
  be1: easing.EasingFunc, be2: easing.EasingFunc,
  sampling: number, assertion = assertClose): void {
  for (let i = 0; i < sampling; i++) {
    const x = i / sampling;
    assertion(be1(x), be2(x));
  }
}

function repeat(n: number): (f: (cycle: number) => void) => void {
  return (f: (cycle: number) => void) => {
    for (let i = 0; i < n; ++i) {
      f(i);
    }
  };
}

describe('EasingFunctions', () => {
  it('should be a function', () => {
    expect(typeof easing.linear).toEqual('function');
  });

  describe('linear curves', () => {
    it('should be linear', () => {
      allEquals(easing.linear, identity, 100);
    });
  });

  describe('common properties', () => {
    it('should be the right value at extremes', () => {
      repeat(1000)(() => {
        Object.values(easing).forEach(f => {
          expect(f(0)).toBe(0);
          expect(f(1)).toBe(1);
        });
      });
    });
  });

  describe('two same instances', () => {
    it('should be strictly equals', () => {
      repeat(100)(() => {
        Object.values(easing).forEach(f => {
          allEquals(f, f, 100, makeAssertCloseWithPrecisioin(0.05));
        });
      });
    });
  });

  describe('symetric curves', () => {
    it('should have a central value y~=0.5 at x=0.5', () => {
      repeat(100)(() => {
        [easing.linear].forEach(f => {
          assertClose(f(0.5), 0.5);
        });
      });
    });

    it('should be symetrical', () => {
      repeat(100)(() => {
        [easing.linear].forEach(f => {
          const sym = x => 1 - f(1 - x);
          allEquals(f, sym, 100);
        });
      });
    });
  });
});
