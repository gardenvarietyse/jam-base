import { Container } from 'pixi.js';
import { ILDTKWorld, LDTKDir } from '../../../lib/ldtk/format';
import {
  OnLevelLoadedFn,
  OnLevelUnloadFn,
  PixiLDTK,
  TilemapKey,
} from '../../../lib/ldtk/pixiLdtk';
import { GameEntity, GameEntityWith } from '../entity';
import { World } from 'miniplex';
import { SystemRunFn, addSystemCleanup } from '..';
import { LDTKLevel } from '../../../lib/ldtk/level';
import { createTilemapBodies } from '../../../lib/ldtk/blompLdtk';

type EntityStore = { [key: string]: GameEntity[] };

export type LDTKComponents = {
  ldtk_world?: {
    data: ILDTKWorld;
    stage: Container;

    level: string;
    change_neighbour?: LDTKDir | undefined;

    force_level_load?: boolean;

    on_loaded?: OnLevelLoadedFn;
    on_unload?: OnLevelUnloadFn;
  };
  ldtk_world_state?: {
    manager: PixiLDTK;
    entities: GameEntity[];
    entities_by_level: EntityStore;
  };
  ldtk_entity?: {
    iid: string;
    identifier: string;
    level: string;
  };
};

export const createLDTKSystem = (
  entity_world: World<GameEntity>,
  stage: Container
): SystemRunFn => {
  const world_cleanup = (entity: GameEntityWith<'ldtk_world_state'>) => {
    entity.ldtk_world_state.manager?.removeFromParent();
    Object.keys(entity.ldtk_world_state.entities_by_level).forEach((level) => {
      entity.ldtk_world_state.entities_by_level[level].forEach((e) =>
        entity_world.remove(e)
      );
    });

    entity_world.removeComponent(entity, 'ldtk_world_state');
  };

  addSystemCleanup(entity_world, 'ldtk_world_state', world_cleanup);

  return (delta: number) => {
    const added = entity_world.with('ldtk_world').without('ldtk_world_state');
    const active = entity_world.with('ldtk_world', 'ldtk_world_state');
    const removed = entity_world.with('ldtk_world_state').without('ldtk_world');

    for (const entity of added) {
      const { ldtk_world } = entity;

      const onLevelLoaded: OnLevelLoadedFn = (
        level: LDTKLevel,
        firstLoad: boolean,
        key: TilemapKey
      ) => {
        createTilemapBodies(level, entity_world);
        ldtk_world.on_loaded?.(level, firstLoad, key);
      };

      const onLevelUnload = (level: LDTKLevel) => {
        const { ldtk_world_state } = entity;
        if (!ldtk_world_state) {
          return;
        }

        if (ldtk_world_state.entities_by_level[level.identifier]) {
          ldtk_world_state.entities_by_level[level.identifier].forEach((e) =>
            entity_world.remove(e)
          );
          ldtk_world_state.entities_by_level[level.identifier] = [];
        }

        ldtk_world.on_unload?.(level);
      };

      const manager = new PixiLDTK({
        world: ldtk_world.data,
        onLevelLoaded,
        onLevelUnload,
      });

      stage.addChild(manager);

      entity_world.addComponent(entity, 'ldtk_world_state', {
        manager,
        entities: [],
        entities_by_level: {},
      });
    }

    for (const entity of active) {
      const { ldtk_world, ldtk_world_state } = entity;

      if (
        !!ldtk_world.level &&
        (ldtk_world.force_level_load ||
          ldtk_world.level !== ldtk_world_state.manager.level)
      ) {
        ldtk_world.force_level_load = false;
        const success = ldtk_world_state.manager.loadLevelByName(
          ldtk_world.level
        );

        if (!success) {
          ldtk_world.level = ldtk_world_state.manager.level;
        }
      }

      if (ldtk_world.change_neighbour) {
        const success = ldtk_world_state.manager.loadNeighbourLevel(
          ldtk_world.change_neighbour
        );

        if (success) {
          ldtk_world.level = ldtk_world_state.manager.level;
        }

        ldtk_world.change_neighbour = undefined;
      }

      ldtk_world_state.manager.update(delta);
    }

    for (const entity of removed) {
      world_cleanup(entity);
    }
  };
};
