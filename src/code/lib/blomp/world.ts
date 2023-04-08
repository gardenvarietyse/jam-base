import { flip, unit } from '../math';
import { Body } from './body';
import { IBodyStore, NaiveBodyStore } from './bodyStore';
import {
  BlockResponse,
  CrossResponse,
  NoResponse,
  ResponseFn,
} from './response';

export type ResolveResult = {
  collision: CollisionData;
  desired_x: number;
  desired_y: number;
};

export type CollisionData = {
  target_x: number;
  target_y: number;
  delta_x: number;
  delta_y: number;
  normal_x: number;
  normal_y: number;
  other: Body;
};

const getDefaultResponse = (a: Body, b: Body) => {
  if (a.trigger || b.trigger) {
    return CrossResponse;
  }

  if (a.ghost || b.ghost) {
    return NoResponse;
  }

  return BlockResponse;
};

const normal = (velocity) => flip(unit(velocity));

export class World {
  private store: IBodyStore;

  constructor(bodyStore: IBodyStore = new NaiveBodyStore()) {
    this.store = bodyStore;
  }

  add(body: Body): Body {
    return this.store.add(body);
  }

  remove(body: Body) {
    this.store.remove(body);
  }

  move(
    body: Body,
    x: number,
    y: number,
    response?: ResponseFn,
    test?: boolean
  ): Array<CollisionData> {
    if (body.freeze) {
      return [];
    }

    let collisions: CollisionData[] = [];
    let desired_positions: number[][] = [];

    this.store.overlapBodies(body, x, y).forEach((other: Body) => {
      if (other === body || other.freeze) {
        return;
      }

      if (!World.testOverlap(body, other, x, y)) {
        return;
      }

      const r = response || getDefaultResponse(body, other);
      const result = World.resolveOne(
        body,
        other,
        x,
        y,
        other.ghost ? NoResponse : r
      );

      collisions.push(result.collision);

      if (!other.trigger) {
        desired_positions.push([result.desired_x, result.desired_y]);
      }
    });

    if (desired_positions.length === 0) {
      if (!test) {
        body.x = x;
        body.y = y;
      }

      return [];
    }

    let closest_desired_x = Number.MAX_VALUE;
    let closest_desired_y = Number.MAX_VALUE;

    desired_positions.forEach((dp) => {
      const [dx, dy] = dp;

      if (Math.abs(dx - body.x) < Math.abs(closest_desired_x - body.x)) {
        closest_desired_x = dx;
      }

      if (Math.abs(dy - body.y) < Math.abs(closest_desired_y)) {
        closest_desired_y = dy;
      }
    });

    body.x = closest_desired_x;
    body.y = closest_desired_y;

    return collisions;
  }

  private static testOverlap(a: Body, b: Body, x: number, y: number): boolean {
    const old_x = a.x;
    const old_y = a.y;

    a.x = x;
    a.y = y;

    const overlap = a.overlaps(b);

    a.x = old_x;
    a.y = old_y;

    return overlap;
  }

  private static resolveOne(
    a: Body,
    b: Body,
    x: number,
    y: number,
    response: ResponseFn
  ): ResolveResult {
    if (!response) {
      throw new Error('resolveOne called without resolve function');
    }

    const [dx, dy] = a.distance(b);

    const velocity_x = x - a.x;
    const velocity_y = y - a.y;

    let move_x = velocity_x;
    let move_y = velocity_y;
    let normal_x = 0;
    let normal_y = 0;

    // ttc = time to collide
    const x_ttc = velocity_x !== 0 ? Math.abs(dx / velocity_x) : 0;
    const y_ttc = velocity_y !== 0 ? Math.abs(dy / velocity_y) : 0;

    if (velocity_x !== 0 && velocity_y === 0) {
      move_x = x_ttc * velocity_x;
      normal_x = normal(velocity_x);
    } else if (velocity_x === 0 && velocity_y !== 0) {
      move_y = y_ttc * velocity_y;
      normal_y = normal(velocity_y);
    } else {
      const shortest_time = Math.min(Math.abs(x_ttc), Math.abs(y_ttc));
      move_x = shortest_time * velocity_x;
      move_y = shortest_time * velocity_y;

      normal_x = normal(velocity_x);
      normal_y = normal(velocity_y);
    }

    const collision = {
      target_x: x,
      target_y: y,
      delta_x: move_x,
      delta_y: move_y,
      normal_x,
      normal_y,
      other: b,
    };

    const [desired_x, desired_y] = response(a, collision);

    return {
      collision,
      desired_x,
      desired_y,
    };
  }
}
