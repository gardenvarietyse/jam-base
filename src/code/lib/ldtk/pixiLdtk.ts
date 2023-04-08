import { Container } from 'pixi.js';

import { LDTKWorld, parseLDTKWorld } from '.';
import { LDTKLevel, LDTKLevelNeighbourSet } from './level';
import { ILDTKWorld, LDTKDir } from './format';

import { TileData, Tilemap } from '../tilemap/tilemap';
import { Asset } from '../../../asset';

const log = (...a) => !!(window as any).DEBUG && console.log(...a);

export type TilemapKey = 'current' | 'n' | 'e' | 's' | 'w';

export type OnLevelLoadedFn = (
  level: LDTKLevel,
  firstLoad: boolean,
  key: TilemapKey
) => void;

export type OnLevelUnloadFn = (level: LDTKLevel) => void;

type PixiLDTKOptions = {
  world: ILDTKWorld;
  onLevelLoaded?: OnLevelLoadedFn;
  onLevelUnload?: OnLevelUnloadFn;
};

const ZIndexForLayer = {
  Background: -10,
  Base: -5,
  Foreground: 2000,
};

const TintForLayer = {
  Background: 0x565656,
  Base: 0xffffff,
  Foreground: 0xffffff,
};

export class PixiLDTK extends Container {
  private world: LDTKWorld;
  private currentLevel: LDTKLevel;

  private tilemaps: { [K in TilemapKey]: Tilemap[] | null } = {
    current: null,
    n: null,
    e: null,
    s: null,
    w: null,
  };

  private onLevelLoaded: OnLevelLoadedFn | undefined;
  private onLevelUnload: OnLevelUnloadFn | undefined;

  get level() {
    return this.currentLevel?.identifier ?? null;
  }

  get levelX() {
    return this.currentLevel?.worldX;
  }

  get levelY() {
    return this.currentLevel?.worldX;
  }

  get levelWidth() {
    return this.currentLevel?.pxWid;
  }

  get levelHeight() {
    return this.currentLevel?.pxHei;
  }

  constructor(options: PixiLDTKOptions) {
    super();

    this.world = parseLDTKWorld(options.world);
    this.onLevelLoaded = options.onLevelLoaded;
    this.onLevelUnload = options.onLevelUnload;
  }

  update(delta: number) {
    Object.keys(this.tilemaps).forEach((k) =>
      this.tilemaps[k]?.forEach((tm) => tm.update(delta))
    );
  }

  loadLevel(level: LDTKLevel, key: TilemapKey, tiles = true) {
    log('loading', level.identifier);
    log(`tiles ${tiles ? '✅' : '❌'}  entities`);
    log('');

    if (tiles) {
      log('- tiles -');
      const layers: Tilemap[] = level.tileLayers
        .filter((l) => l.gridTiles.length > 0)
        .map((layer) => {
          log('layer: ', layer.__identifier);

          const tilesetData = layer.tileset;
          const tilesize = tilesetData.tileGridSize;
          const mapWidth = level.pxWid / tilesize;
          const mapHeight = level.pxHei / tilesize;
          // mega assumption: this is fine
          const asset = tilesetData.relPath
            .replace('../', '')
            .replace('.png', '');
          log('asset:', asset);

          const tileData = layer.gridTiles.reduce<TileData>((td, tile) => {
            // assumption: this is fine for now
            const mapIndex = tile.d[0];

            return {
              ...td,
              [mapIndex]: tile.t,
            };
          }, {});

          const animationData = tilesetData.enumTags.find(
            (et) => et.enumValueId === 'Animation'
          );
          const animations: number[][] = [];

          if (animationData) {
            let animation: number[] = [];

            animationData.tileIds.forEach((ti) => {
              if (animation.length === 0) {
                animation = [ti];
              } else {
                const previousFrame = animation[animation.length - 1];
                if (ti - 1 === previousFrame) {
                  animation.push(ti);
                } else {
                  animations.push(animation);
                  animation = [ti];
                }
              }
            });

            animations.push(animation);
          }

          const tilemap = new Tilemap(
            {
              asset: Asset[asset],

              tileWidth: tilesize,
              tileHeight: tilesize,
              mapWidth,
              mapHeight,
              animations,
            },
            tileData
          );

          tilemap.x = level.worldX;
          tilemap.y = level.worldY;
          tilemap.zIndex = ZIndexForLayer[layer.__identifier] || 0;
          tilemap.tint = TintForLayer[layer.__identifier] || 0xffffff;

          return tilemap;
        });

      if (this.tilemaps[key]) {
        const toRemove = this.tilemaps[key];
        setTimeout(() => {
          log(`remove existing '${key}' tilemap`);

          toRemove?.forEach((tr) => {
            tr.parent.removeChild(tr);
            tr.destroy();
          });
        }, 2000);
      }

      log(`set '${key}' tilemap`);
      this.tilemaps[key] = [];

      this.tilemaps[key] = layers;
      layers.forEach((layer) => this.addChild(layer));

      if (key === 'current') {
        if (this.currentLevel) {
          this.onLevelUnload?.(this.currentLevel);
        }

        this.currentLevel = level;

        const neighbourKeys = Object.keys(
          this.currentLevel.neighbours
        ) as Array<keyof LDTKLevelNeighbourSet>;
        neighbourKeys.forEach((k) => this.loadNeighbourLevel(k, k));
      }
    }

    log('');
  }

  loadLevelByName(name: string): boolean {
    const level = this.world.levels.find((l) => l.identifier === name);

    if (!level) {
      console.warn(`Level '${name}' not found`);
      return false;
    }

    log('Load level', name);

    const firstLoad = !this.tilemaps.current;

    this.loadLevel(level, 'current');
    this.onLevelLoaded?.(level, firstLoad, 'current');

    return true;
  }

  loadNeighbourLevel(direction: LDTKDir, key: TilemapKey = 'current'): boolean {
    if (!this.currentLevel) {
      console.warn('Cannot load neighbour level, there is no current level');
      return false;
    }

    log('Load neighbour level towards', direction, 'key', key);
    const level = this.currentLevel.neighbours[direction];

    // might've caused a bug here now
    if (!level) {
      console.warn(`Current level has no neighbour towards ${direction}`);

      return false;
    }

    this.loadLevel(level, key);
    if (key === 'current') {
      this.onLevelLoaded?.(level, false, key);
    }

    return true;
  }
}
