import { World } from 'miniplex';
import { SystemRunFn } from '..';
import { lerp } from '../../../lib/math';
import { GridNode } from '../pathing/grid_node';
import { GameEntity } from '../entity';

export type PathFollowerComponents = {
  pathing?: {
    goal?: { x: number; y: number };
    path?: GridNode[];
  };
};

export const createPathFollowerSystem = (
  world: World<GameEntity>
): SystemRunFn => {
  const active = world.with('pathing');

  return (delta: number) => {
    for (const entity of active) {
      const { x, y } = entity;
      const { pathing } = entity;

      if (!pathing.path || pathing.path.length === 0) {
        if (!pathing.goal) {
          world.removeComponent(entity, 'pathing');
        }

        return;
      }

      const [nextNode, ...remainingPath] = pathing.path;

      const next_x = nextNode.x * 16 + 8;
      const next_y = nextNode.y * 16 + 12;

      const dir_x = next_x - x;
      const dir_y = next_y - y;

      if (Math.abs(dir_x) < 0.5 && Math.abs(dir_y) < 0.5) {
        pathing.path = remainingPath;
      }

      entity.x = lerp(entity.x, next_x, delta * 8);
      entity.y = lerp(entity.y, next_y, delta * 8);
    }
  };
};
