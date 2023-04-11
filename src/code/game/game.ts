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
import { createKeyboardControllerSystem } from './system/character/keyboard';
import { LDTKLevel } from '../lib/ldtk/level';
import { LDTKDir } from '../lib/ldtk/format';
import { createCameraSystem } from './system/graphics/camera';

export class Game implements IGame {
  private pixi_app: Application;
  private world: World;

  private elapsed = 0;

  private game_entity: GameEntity;
  private game_world: GameEntity;
  private blomp_world: BlompWorld;
  private debugLabel: GameEntity;

  private camera_entity?: GameEntity;
  private player?: GameEntity;
  private current_level?: LDTKLevel;

  create_systems(
    pixi_app: Application,
    entity_world: World<GameEntity>
  ): SystemRunFn[] {
    this.pixi_app = pixi_app;
    this.world = entity_world;

    this.blomp_world = new BlompWorld();

    return [
      createUtilSystem(entity_world, pixi_app.renderer),
      // graphics
      createSpriteSystem(entity_world, pixi_app.stage),
      createLabelSystem(entity_world, pixi_app.stage),
      createTilemapSystem(entity_world, pixi_app.stage),
      createLDTKSystem(entity_world, pixi_app.stage),
      createCameraSystem(entity_world, pixi_app.stage),
      // characters
      createHealthSystem(entity_world),
      createCharacterAnimatorSystem(entity_world),
      createPathFollowerSystem(entity_world),
      createCharacterControllerSystem(entity_world),
      // game logic etc
      createBlompSystem(entity_world, this.blomp_world),
      createGridManagerSystem(entity_world),
      // ui, input
      createKeyboardSystem(entity_world),
      createKeyboardControllerSystem(entity_world),
    ];
  }

  startup(entity_world: World<GameEntity>) {
    this.camera_entity = entity_world.add({
      x: 0,
      y: 0,
      camera: {
        x: 0,
        y: 0,
        pan_speed: 1024,
        container: this.pixi_app.stage,
      },
    });

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
        // todo: base this shit on the current level I guess
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
          this.current_level = level;
          this.camera_entity.camera.x = level.worldX;
          this.camera_entity.camera.y = level.worldY;

          // @ts-ignore
          this.pixi_app.renderer.background.color = level.bgColor;

          const entities = level.entityLayers.find(
            (el) => el.__identifier === 'Entities'
          );

          entities?.entityInstances.forEach((ei) => {
            if (ei.__identifier === 'Player' && this.player) {
              return;
            }

            const entity = spawnEntity(entity_world, ei);

            if (!entity) {
              return;
            }

            if (ei.__identifier === 'Player') {
              this.player = entity;
            } else {
              entity_world.addComponent(entity, 'ldtk_entity', {
                iid: ei.iid,
                identifier: ei.__identifier,
                level: level.identifier,
              });
            }
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

    if (this.player) {
      const cx = this.player.x + this.player.body.width / 2;
      const cy = this.player.y + this.player.body.height / 2;

      if (cx < this.current_level?.worldX) {
        this.switch_level('w');
      } else if (cx > this.current_level?.worldX + this.current_level?.pxWid) {
        this.switch_level('e');
      } else if (cy < this.current_level?.worldY) {
        this.switch_level('n');
      } else if (cy > this.current_level?.worldY + this.current_level?.pxHei) {
        this.switch_level('s');
      }
    }

    if (this.debugLabel?.label) {
      this.debugLabel.label.text = `${this.world.entities.length} entities`;
    }
  }

  switch_level(dir: LDTKDir) {
    if (!this.current_level) {
      return;
    }

    this.game_world.ldtk_world.change_neighbour = dir;
    this.current_level = undefined;
  }
}

export { SETTINGS };
