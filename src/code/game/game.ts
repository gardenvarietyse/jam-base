import { World } from 'miniplex';
import { IGame } from './base';
import { GameEntity } from './system/entity';
import { SystemRunFn } from './system';
import { Application } from 'pixi.js';
import { createSpriteSystem } from './system/graphics/sprite';
import { createTilemapSystem } from './system/graphics/tilemap';
import { createPathFollowerSystem } from './system/character/path_follower';
import { createCharacterAnimatorSystem } from './system/character/animator';
import { createGridManagerSystem } from './system/grid/grid';
import { createKeyboardSystem } from './system/input/keyboard';
import { createHealthSystem } from './system/health';
import { createLabelSystem } from './system/graphics/label';
import { createUtilSystem } from './system/util';
import { SETTINGS } from './settings';
import { WORLD } from '../../asset/world';
import { createLDTKSystem } from './system/ldtk/ldtk';
import { Asset } from '../../asset';
import { createBlompSystem, make_body } from './system/blomp/blomp';
import { World as BlompWorld } from '../lib/blomp';
import { spawnEntity } from './spawn';
import { createCharacterControllerSystem } from './system/character/controller';

export class Game implements IGame {
  private pixi_app: Application;
  private world: World;

  private elapsed = 0;

  private game_entity: GameEntity;
  private game_world: GameEntity;
  private blomp_world: BlompWorld;
  private debugLabel: GameEntity;

  private player: GameEntity;

  create_systems(
    pixi_app: Application,
    world: World<GameEntity>
  ): SystemRunFn[] {
    this.pixi_app = pixi_app;
    this.world = world;

    this.blomp_world = new BlompWorld();

    return [
      createUtilSystem(world, pixi_app.renderer),
      // graphics
      createSpriteSystem(world, pixi_app.stage),
      createLabelSystem(world, pixi_app.stage),
      createTilemapSystem(world, pixi_app.stage),
      createLDTKSystem(world, pixi_app.stage),
      // characters
      createHealthSystem(world),
      createCharacterAnimatorSystem(world),
      createPathFollowerSystem(world),
      createCharacterControllerSystem(world),
      // game logic etc
      createBlompSystem(world, this.blomp_world),
      createGridManagerSystem(world),
      // ui, input
      createKeyboardSystem(world),
    ];
  }

  startup(entity_world: World<GameEntity>) {
    entity_world.add({
      x: 0,
      y: 0,
      keyboard: {
        keys: ['escape'],
        pressed: (keyCode) => {},
      },
    });

    this.game_entity = entity_world.add({
      x: 0,
      y: 0,
      grid_manager: {
        width: SETTINGS.MAP_WIDTH,
        height: SETTINGS.MAP_HEIGHT,
      },
    });

    this.game_world = entity_world.add({
      x: 0,
      y: 0,
      ldtk_world: {
        data: WORLD,
        stage: this.pixi_app.stage,
        level: 'Level_0',
        on_loaded: (level) => {
          // @ts-ignore
          this.pixi_app.renderer.background.color = level.bgColor;

          const entities = level.entityLayers.find(
            (el) => el.__identifier === 'Entities'
          );

          entities?.entityInstances.forEach((ei) => {
            const entity = spawnEntity(entity_world, ei);

            if (!entity) {
              return;
            }

            // todo: persist player somehow
            entity_world.addComponent(entity, 'ldtk_entity', {
              iid: ei.iid,
              identifier: ei.__identifier,
              level: level.identifier,
            });
          });
        },
      },
    });

    // @ts-ignore
    this.pixi_app.stage.eventMode = 'dynamic';
    // @ts-ignore
    this.pixi_app.stage.onpointertap = (e) => {
      const { globalX, globalY } = e;
    };

    this.debugLabel = entity_world.add({
      x: 32,
      y: 16,
      label: {
        text: `${entity_world.entities.length} entities`,
      },
    });
  }

  update(delta: number) {
    this.elapsed += delta;

    this.pixi_app.stage.children.sort((a, b) => {
      if (a.zIndex < b.zIndex) {
        return -1;
      } else if (a.zIndex > b.zIndex) {
        return 1;
      }

      if (a.y < b.y) {
        return -1;
      } else if (a.y > b.y) {
        return 1;
      }

      return 0;
    });

    if (this.debugLabel?.label) {
      this.debugLabel.label.text = `${this.world.entities.length} entities`;
    }
  }
}
export { SETTINGS };
