import { World, Body } from './';

describe('World', () => {
  test('move', () => {
    const world = new World();
    const body = new Body({}, 0, 0, 30, 30);

    world.add(body);
    world.move(body, 91, 8);

    expect(body.x).toBe(91);
    expect(body.y).toBe(8);
  });

  test('resolve collision', () => {
    const world = new World();
    const body1 = new Body({}, 0, 0, 30, 30);
    const body2 = new Body({}, 40, 0, 30, 30);

    world.add(body1);
    world.add(body2);

    world.move(body1, 40, 0);

    expect(body1.x).toBe(10);
    expect(body1.y).toBe(0);
  });

  describe('generate collision normal', () => {
    const TARGET_X = 40;
    const TARGET_Y = 0;

    const world = new World();
    world.add(new Body({}, TARGET_X, TARGET_Y, 30, 30));

    const tests = [
      {
        name: 'collide right',
        x: 0,
        y: 0,
        nx: -1,
        ny: 0,
      },
      {
        name: 'collide left',
        x: 80,
        y: 0,
        nx: 1,
        ny: 0,
      },
      {
        name: 'collide down',
        x: 40,
        y: -40,
        nx: 0,
        ny: -1,
      },
      {
        name: 'collide up',
        x: 30,
        y: 80,
        nx: -1,
        ny: 1,
      },
    ];

    tests.forEach((t) => {
      test(t.name, () => {
        const body = world.add(new Body({}, t.x, t.y, 30, 30));

        const collisions = world.move(body, TARGET_X, TARGET_Y);

        expect(collisions.length).toBe(1);
        expect(collisions[0].normal_x).toBe(t.nx);
        expect(collisions[0].normal_y).toBe(t.ny);
      });
    });
  });

  test('resolve trigger collision', () => {
    const world = new World();
    const body1 = new Body({}, 0, 0, 30, 30);
    const body2 = new Body({}, 40, 0, 30, 30);
    body2.trigger = true;

    world.add(body1);
    world.add(body2);

    world.move(body1, 40, 0);

    expect(body1.x).toBe(40);
    expect(body1.y).toBe(0);
  });
});
