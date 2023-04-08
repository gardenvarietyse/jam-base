import { World } from 'miniplex';
import { Container } from 'pixi.js';
import { addSystemCleanup, SystemRunFn } from '..';
import { TilemapDataSource } from '../../../lib/tilemap/data_source';
import { Tilemap } from '../../../lib/tilemap/tilemap';
import { GameEntity } from '../entity';

export type TilemapComponents = {
  tile_source?: TilemapDataSource;

  tilemap?: {
    asset: string;
    tile_width: number;
    tile_height: number;
    map_width: number;
    map_height: number;
    done?: () => void;
  };
  tilemap_state?: {
    instance: Tilemap;
  };

  tilemap_set_tile?: number;
};

export const createTilemapSystem = (
  world: World<GameEntity>,
  stage: Container
): SystemRunFn => {
  const tilemap_cleanup = (entity: GameEntity) => {
    entity.tilemap_state?.instance?.removeFromParent();
    world.removeComponent(entity, 'tilemap_state');
  };

  const added = world.with('tilemap').without('tilemap_state');
  const active = world.with('tilemap', 'tilemap_state');
  const removed = world.with('tilemap_state').without('tilemap');
  const tile_setters = world.with('tilemap_set_tile');

  addSystemCleanup(world, 'tilemap_state', tilemap_cleanup);

  return (delta: number) => {
    for (const entity of added) {
      const { x, y } = entity;
      const { tile_source } = entity;

      const instance = new Tilemap(
        {
          asset: entity.tilemap.asset,
          tileWidth: entity.tilemap.tile_width,
          tileHeight: entity.tilemap.tile_height,
          mapWidth: entity.tilemap.map_width,
          mapHeight: entity.tilemap.map_height,
          done: entity.tilemap.done,
        },
        tile_source?.data
      );

      instance.position.x = x;
      instance.position.y = y;

      stage.addChild(instance);
      world.addComponent(entity, 'tilemap_state', { instance });
    }

    for (const entity of active) {
      const { x, y } = entity;
      const { tile_width, tile_height } = entity.tilemap;
      const { instance } = entity.tilemap_state;

      instance.position.x = x;
      instance.position.y = y;

      for (const entity of tile_setters) {
        const { x, y } = entity;
        const tx = Math.floor(x / tile_width);
        const ty = Math.floor(y / tile_height);

        instance.setTile(tx, ty, entity.tilemap_set_tile);
        world.remove(entity);
      }
    }

    for (const entity of removed) {
      tilemap_cleanup(entity);
    }
  };
};
