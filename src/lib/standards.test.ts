import { describe, expect, it } from 'vitest';
import { calcStandards, formatStandards, roundStandards } from './standards';

describe('calcStandards', () => {
  it('matches the figure printed on AU beer packaging', () => {
    // 375mL can of full-strength 4.8% beer -> 1.4 standard drinks.
    expect(roundStandards(calcStandards(375, 4.8))).toBeCloseTo(1.4, 5);
  });

  it('matches a standard glass of wine', () => {
    // 150mL glass of 13% wine -> ~1.5 standard drinks.
    expect(roundStandards(calcStandards(150, 13))).toBeCloseTo(1.5, 5);
  });

  it('matches a nip of spirits', () => {
    // 30mL nip of 40% spirits -> ~0.9 standard drinks.
    expect(roundStandards(calcStandards(30, 40))).toBeCloseTo(0.9, 5);
  });

  it('is proportional to volume and ABV', () => {
    expect(calcStandards(750, 4.8)).toBeCloseTo(calcStandards(375, 4.8) * 2, 10);
    expect(calcStandards(375, 9.6)).toBeCloseTo(calcStandards(375, 4.8) * 2, 10);
  });

  it.each([
    ['zero volume', 0, 4.8],
    ['zero ABV', 375, 0],
    ['negative volume', -375, 4.8],
    ['negative ABV', 375, -4.8],
    ['NaN volume', NaN, 4.8],
    ['NaN ABV', 375, NaN],
    ['Infinity volume', Infinity, 4.8],
    ['Infinity ABV', 375, Infinity],
  ])('returns 0 for %s', (_label, volumeMl, abvPercent) => {
    expect(calcStandards(volumeMl, abvPercent)).toBe(0);
  });
});

describe('roundStandards', () => {
  it('rounds to 1 decimal place', () => {
    expect(roundStandards(1.44)).toBe(1.4);
    expect(roundStandards(1.45)).toBe(1.5);
    expect(roundStandards(1.449)).toBe(1.4);
  });

  it('is a no-op for values already at 1dp', () => {
    expect(roundStandards(2.3)).toBe(2.3);
    expect(roundStandards(0)).toBe(0);
  });
});

describe('formatStandards', () => {
  it('always renders exactly 1 decimal place', () => {
    expect(formatStandards(1)).toBe('1.0');
    expect(formatStandards(1.44)).toBe('1.4');
    expect(formatStandards(0)).toBe('0.0');
  });
});
