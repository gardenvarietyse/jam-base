import { World } from 'miniplex';
import { SystemRunFn } from '..';
import { AStar } from '../../../lib/pathing/a_star';
import { SETTINGS } from '../../settings';
import { GameEntity } from '../entity';
import { GridNode } from '../pathing/grid_node';
import { PathScorer } from '../pathing/path_scorer';
import { LDTKLevel } from '../../../lib/ldtk/level';
import { createTilemapPathNodes } from '../../../lib/ldtk/gridLdtk';

type GridManagerComponent = {
  update_for_level?: LDTKLevel;
  astar?: AStar<GridNode>;
  path_grid?: GridNode[];
  find_path?: (
    from: GridNode,
    to: GridNode,
    check_neighbours?: boolean
  ) => GridNode[] | null;
};

export type GridComponents = {
  grid_manager?: GridManagerComponent;
};

export const createGridManagerSystem = (
  world: World<GameEntity>
): SystemRunFn => {
  const managers = world.with('grid_manager');
  const pathing_entities = world.with('pathing');

  return (delta: number) => {
    let grid_manager: GridManagerComponent | undefined = undefined;

    if (managers.size > 1) {
      throw new Error('only 1 grid_manager allowed');
    } else if (managers.size === 1) {
      const manager = managers.first!;
      grid_manager = manager.grid_manager;
    }

    if (!grid_manager) {
      return;
    }

    if (!grid_manager.astar) {
      grid_manager.astar = new AStar<GridNode>(new PathScorer());
      grid_manager.find_path = (from, to, check_neighbours) =>
        grid_manager.astar.get_path(from, to, check_neighbours);
    }

    if (grid_manager.update_for_level) {
      for (const entity of pathing_entities) {
        // world.removeComponent(entity, 'pathing');
      }

      const path_nodes = createTilemapPathNodes(grid_manager.update_for_level);
      grid_manager.path_grid = path_nodes;

      grid_manager.update_for_level = undefined;
      console.log(grid_manager.path_grid);
      return;
    }

    for (const entity of pathing_entities) {
      if (!entity.pathing.goal || !!entity.pathing.path) {
        continue;
      }

      // todo: calculate goal based on current level position and stuff

      const { x, y } = entity;
      const { x: ex, y: ey } = entity.pathing.goal!;

      const start_x = Math.floor(x / SETTINGS.TILE_WIDTH) * SETTINGS.TILE_WIDTH;
      const start_y =
        Math.floor(y / SETTINGS.TILE_HEIGHT) * SETTINGS.TILE_HEIGHT;
      const start = grid_manager.path_grid?.find(
        (n) => n.x === start_x && n.y === start_y
      );

      if (!start) {
        console.warn('failed to find goal start node');
        entity.pathing.goal = undefined;
        continue;
      }

      const end_x = Math.floor(
        Math.floor(ex / SETTINGS.TILE_WIDTH) * SETTINGS.TILE_WIDTH
      );
      const end_y = Math.floor(
        Math.floor(ey / SETTINGS.TILE_HEIGHT) * SETTINGS.TILE_HEIGHT
      );
      const end = grid_manager.path_grid?.find(
        (n) => n.x === end_x && n.y === end_y
      );

      if (!end) {
        console.log(end_x, end_y);
        console.warn('failed to find goal end node');
        entity.pathing.goal = undefined;

        continue;
      }

      const path = grid_manager.astar?.get_path(start, end, true);
      if (path) {
        entity.pathing.path = path;
        console.log(path);
      } else {
        console.warn('failed to find goal path');
        entity.pathing.goal = undefined;
      }
    }
  };
};
