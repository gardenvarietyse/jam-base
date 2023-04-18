import { World } from 'miniplex';
import { SystemRunFn } from '..';
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
  const active = world.with('controller', 'pathing');

  return (delta: number) => {
    for (const entity of active) {
      const { x, y } = entity;
      const { controller, pathing } = entity;

      if (!pathing.path || pathing.path.length === 0) {
        if (!pathing.goal) {
          world.removeComponent(entity, 'pathing');
        }

        return;
      }

      const [nextNode, ...remainingPath] = pathing.path;

      const next_x = nextNode.x;
      const next_y = nextNode.y; // todo: find tile size somehow

      const dir_x = next_x - x;
      const dir_y = next_y - y;

      if (Math.abs(dir_x) < 2) {
        pathing.path = remainingPath;
        controller.left = false;
        controller.right = false;

        if (remainingPath.length === 0) {
          world.removeComponent(entity, 'pathing');
        }
      } else {
        // dumb, redo this
        console.log(Math.abs(dir_x));
        if (dir_x < 0) {
          controller.left = true;
          controller.right = false;
        } else if (dir_x > 0) {
          controller.left = false;
          controller.right = true;
        } else {
          controller.left = false;
          controller.right = false;
        }
      }
    }
  };
};
