import { GridNode } from '../../game/system/pathing/grid_node';
import { LDTKLevel } from './level';

export const createTilemapPathNodes = (level: LDTKLevel) => {
  // assumption: all layers have the same grid size
  const first_tile_layer = level.tileLayers[0];
  const grid_size = first_tile_layer.tileset.tileGridSize;
  const world_ox = level.worldX;
  const world_oy = level.worldY;

  const width = level.pxWid / grid_size;
  const height = level.pxHei / grid_size;

  const grid_nodes: GridNode[] = [];

  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      const node = new GridNode(
        x * grid_size + world_ox,
        y * grid_size + world_oy
      );
      grid_nodes.push(node);
    }
  }

  // configure neighbours
  grid_nodes.forEach((node, i) => {
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

      const neighbour = grid_nodes[neighbour_index];
      node.add_neighbour(neighbour);
    });
  });

  // set up node states
  level.tileLayers.forEach((layer) => {
    if (layer.__identifier === 'Background') {
      return;
    }

    const blocking_tiles =
      layer.tileset.enumTags.find((et) => et.enumValueId === 'Block')
        ?.tileIds || [];

    layer.gridTiles
      .filter((gt) => blocking_tiles.includes(gt.t))
      .forEach((gt) => {
        const [x, y] = gt.px;

        const grid_node = grid_nodes.find(
          (gn) => gn.x === x + world_ox && gn.y === y + world_oy
        );

        if (!grid_node) {
          return;
        }

        grid_node.block = true;
      });
  });

  grid_nodes.forEach((gn) => {
    const neighbour_down = grid_nodes.find(
      (n) => n.x === gn.x && n.y === gn.y + grid_size
    );

    if (!neighbour_down?.block) {
      gn.in_air = true;
    }
  });

  return grid_nodes;
};
