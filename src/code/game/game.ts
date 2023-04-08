import { World } from 'miniplex';
import { IGame } from './base';
import { GameEntity } from './system/entity';
import { SystemRunFn } from './system';
import { Application, DisplayObject, Graphics } from 'pixi.js';
import { createSpriteSystem } from './system/graphics/sprite';
import { Asset } from '../../asset';
import { createTilemapSystem } from './system/graphics/tilemap';
import { createPathFollowerSystem } from './system/character/path_follower';
import { createCharacterAnimatorSystem } from './system/character/animator';
import { createGridManagerSystem } from './system/grid/grid';
import { createKeyboardSystem } from './system/input/keyboard';
import { createHealthSystem } from './system/health';
import { createLabelSystem } from './system/graphics/label';
import { createUtilSystem } from './system/util';
import { spawnRunnerLabel } from './system/factory/spawnRunnerLabel';
import { SETTINGS } from './settings';
import { TilemapDataSource } from '../lib/tilemap/data_source';
import { nrandom } from '../lib/math';

export class Game implements IGame {
  private pixi_app: Application;
  private world: World;

  private elapsed = 0;

  private game_entity: GameEntity;
  private debugLabel: GameEntity;

  private selected_entities: GameEntity[] = [];

  private tilemap_data: TilemapDataSource;

  create_systems(
    pixi_app: Application,
    world: World<GameEntity>
  ): SystemRunFn[] {
    this.pixi_app = pixi_app;
    this.world = world;

    return [
      createUtilSystem(world, pixi_app.renderer),
      // graphics
      createSpriteSystem(world, pixi_app.stage),
      createLabelSystem(world, pixi_app.stage),
      createTilemapSystem(world, pixi_app.stage),
      // characters
      createHealthSystem(world),
      createCharacterAnimatorSystem(world),
      createPathFollowerSystem(world),
      // game logic
      createGridManagerSystem(world),
      // ui, input
      createKeyboardSystem(world),
    ];
  }

  startup(world: World<GameEntity>) {
    world.add({
      x: 0,
      y: 0,
      keyboard: {
        keys: ['escape'],
        pressed: (keyCode) => {},
      },
    });

    this.tilemap_data = new TilemapDataSource(
      SETTINGS.MAP_WIDTH,
      SETTINGS.MAP_HEIGHT,
      Array(SETTINGS.MAP_WIDTH * SETTINGS.MAP_HEIGHT)
        .fill(0)
        .map((t, i) => {
          const rock = Math.random() < 1 / 100;

          return rock ? 3 : Math.random() < 0.2 ? 0 : 1;
        })
    );

    this.game_entity = world.add({
      x: 0,
      y: 0,
      tilemap: {
        asset: Asset.tiles,
        tile_width: SETTINGS.TILE_WIDTH,
        tile_height: SETTINGS.TILE_HEIGHT,
        map_width: SETTINGS.MAP_WIDTH,
        map_height: SETTINGS.MAP_HEIGHT,
        done: () => {},
      },
      tile_source: this.tilemap_data,
      grid_manager: {
        width: SETTINGS.MAP_WIDTH,
        height: SETTINGS.MAP_HEIGHT,
      },
      task_manager: {},
      construction: { active: false },
    });

    this.pixi_app.stage.eventMode = 'dynamic';
    this.pixi_app.stage.onpointertap = (e) => {
      const { globalX, globalY } = e;
    };

    this.debugLabel = world.add({
      x: 16,
      y: 16,
      label: {
        text: `${world.entities.length} entities`,
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
