import { Body } from './body';
import { CollisionData } from './world';

/**
 * A response function takes a body we're trying to move, and information about
 * a potential collision. Returns which position we desire this body to end up in.
 */
export type ResponseFn = (body: Body, data: CollisionData) => [number, number];

export const BlockResponse: ResponseFn = (body, data) => {
  return [body.x + data.delta_x, body.y + data.delta_y];
};

export const CrossResponse: ResponseFn = (_, data) => {
  data.normal_x = data.normal_y = 100;
  return [data.target_x, data.target_y];
};

export const NoResponse: ResponseFn = (body, data) => {
  return [body.x, body.y];
};
