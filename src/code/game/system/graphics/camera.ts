import { World } from 'miniplex';
import { Container } from 'pixi.js';
import { GameEntity } from '../entity';
import { SystemRunFn } from '..';
import { unit } from '../../../lib/math';

export type CameraComponents = {
  camera?: {
    x: number;
    y: number;
    pan_speed: number;

    container: Container;
  };
};

export const createCameraSystem = (
  world: World<GameEntity>,
  stage: Container
): SystemRunFn => {
  const active = world.with('camera');

  return (delta: number) => {
    for (const entity of active) {
      const { x, y, pan_speed, container } = entity.camera;

      const distance_x = x - entity.x;
      entity.x =
        Math.abs(distance_x) > 2
          ? entity.x + unit(distance_x) * pan_speed * delta
          : x;

      const distance_y = y - entity.y;
      entity.y =
        Math.abs(distance_y) > 2
          ? entity.y + unit(distance_y) * pan_speed * delta
          : y;

      container.x = -entity.x;
      container.y = -entity.y;
    }
  };
};
