import { World } from 'miniplex';
import { SystemRunFn } from '..';
import { GridNode } from '../pathing/grid_node';
import { GameEntity, GameEntityWith } from '../entity';

export type PathFollowerComponents = {
  pathing?: {
    goal?: { x: number; y: number };
    path?: GridNode[];
    node_time?: number;
  };
};

const finish_pathing = (
  world: World<GameEntity>,
  entity: GameEntityWith<'pathing' | 'controller'>
) => {
  world.removeComponent(entity, 'pathing');
  entity.controller.left = false;
  entity.controller.right = false;
  entity.controller.jump = false;
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
          finish_pathing(world, entity);
        }

        return;
      } else if (pathing.node_time > 1) {
        // todo: hardcoded value above
        finish_pathing(world, entity);
        return;
      }

      const [nextNode, ...remainingPath] = pathing.path;

      pathing.node_time = (pathing.node_time ?? 0) + delta;

      const next_x = nextNode.x;
      const next_y = nextNode.y;

      const dir_x = next_x - x;
      const dir_y = next_y - y;

      if (Math.abs(dir_x) < 2 && Math.abs(dir_y) < 2) {
        pathing.path = remainingPath;
        pathing.node_time = 0;
        controller.left = false;
        controller.right = false;

        if (remainingPath.length === 0) {
          world.removeComponent(entity, 'pathing');
        }
      } else {
        // dumb, redo this
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

        if (Math.abs(dir_x) < 2 && dir_y > 0) {
          controller.left = controller.right = false;
        }

        controller.jump = dir_y < 0;
      }
    }
  };
};
