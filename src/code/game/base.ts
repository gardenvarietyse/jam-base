import { World } from 'miniplex';
import { Application } from 'pixi.js';
import { GameEntity } from './system/entity';
import { Game } from './game';
import { initSystems, SystemRunFn } from './system';

export interface IGame {
  create_systems(
    pixiApp: Application,
    entityWorld: World<GameEntity>
  ): SystemRunFn[];

  startup(entityWorld: World<GameEntity>);
  update(delta: number);
}

export class Base {
  private pixi_app: Application;
  private entity_world: World;
  private run_systems: SystemRunFn;
  private game: IGame;

  constructor() {
    this.initPixi();

    this.entity_world = new World<GameEntity>();

    this.game = new Game();

    this.run_systems = initSystems(
      this.game.create_systems(this.pixi_app, this.entity_world)
    );
    this.game.startup(this.entity_world);

    let lastTimestamp: DOMHighResTimeStamp;
    const tick = (timestamp: DOMHighResTimeStamp = 0) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (delta <= 0.05) {
        this.run_systems(delta);
        this.game.update(delta);
      }

      window.requestAnimationFrame(tick);
    };

    tick();
  }

  initPixi() {
    const RES_SCALE = 4;

    this.pixi_app = new Application({
      width: 2048 / RES_SCALE,
      height: 2048 / RES_SCALE,
      resolution: RES_SCALE,
      background: 0x333333,
    });

    // @ts-ignore
    document.body.appendChild(this.pixi_app.view);
  }
}
