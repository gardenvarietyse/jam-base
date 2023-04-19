import { World } from 'miniplex';
import { SystemRunFn } from '..';
import { GridNode } from '../pathing/grid_node';
import { GameEntity, GameEntityWith } from '../entity';

export type PathFollowerComponents = {
  pathing?: {
    goal?: { x: number; y: number };
    path?: GridNode[];
    on_path_found?: (path: GridNode[]) => void;
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
  const active = world.with(
    'body',
    'controller_state',
    'controller',
    'pathing'
  );

  return (delta: number) => {
    for (const entity of active) {
      const { x, y } = entity;
      const { body, controller_state, controller, pathing } = entity;

      if (!pathing.path || pathing.path.length === 0) {
        if (!pathing.goal) {
          finish_pathing(world, entity);
        }

        continue;
      } else if (pathing.node_time > 2) {
        finish_pathing(world, entity);
        continue;
      }

      const [next_node, ...remaining_path] = pathing.path;

      pathing.node_time = (pathing.node_time ?? 0) + delta;

      const next_x = next_node.x;
      const next_y = next_node.y;

      const diff_x = next_x - x;
      const diff_y = next_y - y;

      if (Math.abs(diff_x) < 1 && Math.abs(diff_y) < 2) {
        pathing.path = remaining_path;
        pathing.node_time = 0;
        controller.left = false;
        controller.right = false;
        controller.jump = false;

        if (remaining_path.length === 0) {
          world.removeComponent(entity, 'pathing');
        }

        continue;
      }

      if (Math.abs(diff_x) >= 1) {
        if (diff_x < 0) {
          controller.left = true;
          controller.right = false;
        } else if (diff_x > 0) {
          controller.left = false;
          controller.right = true;
        }
      } else {
        controller.left = false;
        controller.right = false;
      }

      if (diff_y < 0) {
        controller.jump = true;

        if (!controller_state.can_jump && body.grounded) {
          controller.jump = false;
        }
      }
    }
  };
};
