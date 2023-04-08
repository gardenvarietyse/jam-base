import { World } from 'miniplex';
import { IRenderer } from 'pixi.js';
import { SystemRunFn } from '../';
import { GameEntity } from '../entity';

export type UtilComponents = {
  ttl?: number;
  runner?: {
    x?: number;
    y?: number;
  };
  offscreen_kill?: true;
};

export const createUtilSystem = (
  world: World<GameEntity>,
  renderer: IRenderer
): SystemRunFn => {
  const ttl = world.with('ttl');
  const runners = world.with('runner');
  const offscreen_kills = world.with('offscreen_kill');

  return (delta: number) => {
    for (const entity of ttl) {
      entity.ttl -= delta;

      if (entity.ttl <= 0) {
        world.remove(entity);
      }
    }

    for (const entity of runners) {
      const { x, y } = entity.runner;

      entity.x += (x ?? 0) * delta;
      entity.y += (y ?? 0) * delta;
    }

    for (const entity of offscreen_kills) {
      const { x, y } = entity;

      if (
        x <= 0 ||
        x >= renderer.width / renderer.resolution ||
        y <= 0 ||
        y >= renderer.height / renderer.resolution
      ) {
        world.remove(entity);
      }
    }
  };
};
