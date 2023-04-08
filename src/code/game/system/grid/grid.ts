import { World } from 'miniplex';
import { SystemRunFn } from '..';
import { AStar } from '../../../lib/pathing/a_star';
import { TileData } from '../../../lib/tilemap/tilemap';
import { SETTINGS } from '../../settings';
import { GameEntity } from '../entity';
import { GridNode } from '../pathing/grid_node';
import { PathScorer } from '../pathing/path_scorer';

type GridManagerComponent = {
  width: number;
  height: number;
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

  grid_occupant?: {
    current?: GridNode;
  };

  grid_set_node?: number;
};

// todo: don't hard code this in system
const tileToWalkable = (t: number): boolean => {
  switch (t) {
    case 3:
    case 4:
    case 5:
      return false;
    default:
      return true;
  }
};

const initGrid = (entity: GridComponents, tile_data?: TileData) => {
  const { grid_manager } = entity;

  if (!grid_manager) {
    return;
  }

  const { width, height } = grid_manager;

  grid_manager.astar = new AStar<GridNode>(new PathScorer());
  grid_manager.path_grid = [];

  if (tile_data) {
    Object.keys(tile_data).forEach((ti) => {
      const i = ti as unknown as number;

      const x = i % grid_manager.width;
      const y = Math.floor(i / grid_manager.height);

      const tile = tile_data[i];

      const node = new GridNode(x, y);
      node.walkable = tileToWalkable(tile);

      grid_manager.path_grid!.push(node);
    });
  } else {
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const node = new GridNode(x, y);
        grid_manager.path_grid.push(node);
      }
    }
  }

  grid_manager.path_grid.forEach((node, i) => {
    const x = i % width;
    const y = Math.floor(i / height);

    const offsets = [
      [-1, -1],
      [0, -1],
      [1, -1],
      [-1, 0],
      [1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
    ];

    offsets.forEach((offset) => {
      const [ox, oy] = offset;

      const nx = x + ox;
      const ny = y + oy;

      const neighbour_index = ny * height + nx;
      if (neighbour_index < 0 || neighbour_index > width * height - 1) {
        return;
      }

      const neighbour = grid_manager.path_grid![neighbour_index];
      node.add_neighbour(neighbour);
    });
  });

  grid_manager.find_path = (from, to, check_neighbours) =>
    grid_manager.astar!.get_path(from, to, check_neighbours);
};

export const createGridManagerSystem = (
  world: World<GameEntity>
): SystemRunFn => {
  const managers = world.with('grid_manager');
  const occupants = world.with('grid_occupant');
  const pathing_entities = world.with('pathing');
  const node_setters = world.with('grid_set_node');

  let next_update = 1;

  return (delta: number) => {
    let grid_manager: GridManagerComponent | undefined = undefined;

    if (managers.size > 1) {
      throw new Error('only 1 grid_manager allowed');
    } else if (managers.size === 1) {
      const manager = managers.first!;
      grid_manager = manager.grid_manager;

      if (!grid_manager?.astar) {
        initGrid(manager, manager.tile_source?.data);
      }
    }

    if (!grid_manager) {
      return;
    }

    for (const entity of pathing_entities) {
      if (!entity.pathing.goal) {
        continue;
      }

      let attempts = 3;

      while (attempts > 0) {
        const { x, y } = entity;
        const { x: ex, y: ey } = entity.pathing.goal!;

        const start_x = Math.floor(x / SETTINGS.TILE_WIDTH);
        const start_y = Math.floor((y - 8) / SETTINGS.TILE_HEIGHT);
        const start = grid_manager.path_grid?.find(
          (n) => n.x === start_x && n.y === start_y
        );

        if (!start) {
          continue;
        }

        const end_x = Math.floor(ex / SETTINGS.TILE_WIDTH);
        const end_y = Math.floor((ey - 8) / SETTINGS.TILE_HEIGHT);
        const end = grid_manager.path_grid?.find(
          (n) => n.x === end_x && n.y === end_y
        );

        if (!end) {
          continue;
        }

        const path = grid_manager.astar?.get_path(start, end, true);
        if (path) {
          entity.pathing.path = path;
          break;
        } else {
          entity.pathing.goal.y += 2;
          --attempts;
        }
      }

      if (!entity.pathing.path) {
        console.warn('failed to find goal path');
      }

      entity.pathing.goal = undefined;
    }

    for (const entity of node_setters) {
      const { x, y } = entity;

      const tx = Math.floor(x / SETTINGS.TILE_WIDTH);
      const ty = Math.floor(y / SETTINGS.TILE_HEIGHT);

      const index = ty * grid_manager.width + tx;

      if (index < 0 || index > grid_manager.width * grid_manager.height - 1) {
        console.warn('grid_manager: node_setter out of bounds');
      } else if (grid_manager.path_grid) {
        const { grid_set_node } = entity;

        grid_manager.path_grid[index].walkable = tileToWalkable(grid_set_node);
      }

      world.remove(entity);
    }

    // update grid occupants once per second
    next_update -= delta;
    if (next_update > 0) {
      return;
    }
    next_update += 1;

    for (const entity of occupants) {
      const { x, y, grid_occupant } = entity;

      const grid_x = Math.floor(x / SETTINGS.TILE_WIDTH);
      const grid_y = Math.floor((y - 8) / SETTINGS.TILE_HEIGHT);

      const current = grid_manager.path_grid?.find(
        (n) => n.x === grid_x && n.y === grid_y
      );

      if (!current) {
        return;
      }

      if (grid_occupant.current) {
        grid_occupant.current.occupant = undefined;
      }

      grid_occupant.current = current;
      current.occupant = entity;
    }
  };
};
