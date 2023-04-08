import { Body } from './body';

describe('Body', () => {
  test('constructor', () => {
    const good = () => new Body({}, 0, 0, 1, 1);
    const badWidth = () => new Body({}, 0, 0, -1, 1);
    const badHeight = () => new Body({}, 0, 0, 1, -1);

    expect(good).not.toThrow();
    expect(badWidth).toThrow('width must be non-zero');
    expect(badHeight).toThrow('height must be non-zero');
  });

  test('getters', () => {
    const body = new Body({}, 10, 20, 30, 40);

    expect(body.right).toBe(40);
    expect(body.bottom).toBe(60);
  });

  test('overlaps', () => {
    const a = new Body({}, 0, 0, 10, 10);
    const b = new Body({}, 20, 0, 10, 10);
    const c = new Body({}, 15, 0, 10, 10);

    expect(a.overlaps(b)).toBe(false);
    expect(b.overlaps(a)).toBe(false);

    expect(a.overlaps(c)).toBe(false);
    expect(c.overlaps(a)).toBe(false);

    expect(c.overlaps(b)).toBe(true);
    expect(b.overlaps(c)).toBe(true);

    expect(a.overlaps(a)).toBe(true);
  });

  test('distance', () => {
    const a = new Body({}, 0, 0, 10, 10);
    const b = new Body({}, 20, 30, 10, 10);

    expect(a.distance(a)).toEqual(expect.arrayContaining([0, 0]));
    expect(a.distance(b)).toEqual(expect.arrayContaining([10, 20]));
    expect(b.distance(a)).toEqual(expect.arrayContaining([10, 20]));
  });
});
