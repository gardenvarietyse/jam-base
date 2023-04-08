import { Body } from './body';

export interface IBodyStore {
  add(body: Body): Body;
  remove(body: Body): void;
  overlapBodies(body: Body, x: number, y: number): Set<Body> | Array<Body>;
}

export class NaiveBodyStore implements IBodyStore {
  protected bodies = new Set<Body>();

  add(body: Body) {
    if (this.bodies.has(body)) {
      throw new Error('Body already exists in world');
    }

    this.bodies.add(body);

    return body;
  }

  remove(body: Body) {
    if (!this.bodies.has(body)) {
      throw new Error('Body does not exist in world');
    }

    this.bodies.delete(body);
  }

  overlapBodies(body: Body, x: number, y: number) {
    if (!this.bodies.has(body)) {
      throw new Error('Body does not exist in world');
    }

    return this.bodies;
  }
}
