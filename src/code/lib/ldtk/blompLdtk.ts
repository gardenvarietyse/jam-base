import { World } from 'miniplex';
import { LDTKLevel } from './level';
import { GameEntity } from '../../game/system/entity';

export const createTilemapBodies = (
  level: LDTKLevel,
  entity_world: World<GameEntity>
) => {
  level.tileLayers.forEach((layer) => {
    if (layer.__identifier === 'Background') {
      return;
    }

    const blockingTiles =
      layer.tileset.enumTags.find((et) => et.enumValueId === 'Block')
        ?.tileIds || [];

    const platformTiles =
      layer.tileset.enumTags.find((et) => et.enumValueId === 'Platform')
        ?.tileIds || [];

    layer.gridTiles.forEach((gt) => {
      const block = blockingTiles.includes(gt.t);
      const platform = platformTiles.includes(gt.t);

      if (!block && !platform) {
        return;
      }

      const [x, y] = gt.px;
      entity_world.add({
        x: x + level.worldX,
        y: y + level.worldY,
        body: {
          width: layer.tileset.tileGridSize,
          height: layer.tileset.tileGridSize,
          velocity_x: 0,
          velocity_y: 0,

          static: true,
          platform,
          groups: ['static'],
          ignore_groups: [],

          can_push: false,
          pushable: false,

          grounded: false,

          ghost: false,
          trigger: false,
          ignore_gravity: false,
        },
        ldtk_entity: {
          iid: 'tile',
          identifier: 'tile',
          level: level.identifier,
        },
      });
    });
  });
};
