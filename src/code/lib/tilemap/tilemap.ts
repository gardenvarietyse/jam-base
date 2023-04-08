import {
  Assets,
  ColorSource,
  Container,
  MIPMAP_MODES,
  Rectangle,
  SCALE_MODES,
  Sprite,
  Texture,
} from 'pixi.js';

export type AnimationFrames = number[];
export type Animations = AnimationFrames[];

export interface ITilemapOptions {
  tileWidth?: number;
  tileHeight?: number;
  mapWidth?: number;
  mapHeight?: number;

  asset: string;
  done?: () => void;

  animations?: Animations;
}

const DEFAULT_OPTIONS = {
  tileWidth: 16,
  tileHeight: 16,
  mapWidth: 16,
  mapHeight: 16,
};

export type TileData = { [key: number]: number };

const FRAME_LENGTH = 1 / 8;

export class Tilemap extends Container {
  private ready = false;
  private sprites: Sprite[] = [];
  private options: ITilemapOptions;

  private animations: { [key: number]: AnimationFrames } = {};
  private nextFrameTime = FRAME_LENGTH;

  private _tint: ColorSource = 0xffffff;

  get tint(): ColorSource {
    return this.sprites[0].tint;
  }

  set tint(t: ColorSource) {
    this._tint = t;
    this.sprites.forEach((s) => (s.tint = t));
  }

  constructor(options: ITilemapOptions, tileData?: TileData) {
    super();
    this.options = { ...DEFAULT_OPTIONS, ...options };

    const { mapWidth, mapHeight, tileWidth, tileHeight } = this.options;

    this.options.animations?.forEach((a) => {
      const key = a[0];
      this.animations[key] = a;
    });

    Assets.load(options.asset).then((base) => {
      const tileCount = mapWidth! * mapHeight!;

      for (let i = 0; i < tileCount; ++i) {
        const [tx, ty] = this.tileCoords(tileData?.[i] ?? 0);
        const texture = new Texture(base, this.makeTextureFrame(tx, ty));

        texture.baseTexture.mipmap = MIPMAP_MODES.OFF;
        texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;

        const instance = new Sprite(texture);

        const [mx, my] = this.mapCoords(i);
        instance.position.x = mx * tileWidth!;
        instance.position.y = my * tileHeight!;
        instance.roundPixels = true;
        instance.tint = this._tint;

        if (tileData?.[i] === undefined) {
          instance.visible = false;
        }

        this.sprites.push(instance);
        this.addChild(instance);
      }

      this.ready = true;

      options.done?.();
    });
  }

  destroy() {
    super.destroy({ baseTexture: false, texture: true });

    this.sprites.forEach((s) => s.destroy());
  }

  update(delta: number) {
    this.nextFrameTime -= delta;

    if (this.nextFrameTime <= 0) {
      this.updateAnimatedTiles();
      this.nextFrameTime = FRAME_LENGTH + this.nextFrameTime;
    }
  }

  setTile(x: number, y: number, i: number) {
    if (!this.ready) {
      console.warn('Tilemap not constructed yet');
      return;
    }

    if (x < 0 || y < 0) {
      console.warn('Non-negative tile positions only');
      return;
    }

    const { mapWidth, mapHeight } = this.options;

    if (x >= mapWidth!) {
      console.warn(`No tile at x ${x}, max is ${mapWidth! - 1}`);
      return;
    }

    if (y >= mapHeight!) {
      console.warn(`No tile at y ${y}, max is ${mapHeight! - 1}`);
      return;
    }

    const index = this.mapIndex(x, y);
    const sprite = this.sprites[index];

    if (i >= 0) {
      sprite.visible = true;
      const [tx, ty] = this.tileCoords(i);
      this.setSpriteTile(sprite, tx, ty);
    } else {
      sprite.visible = false;
    }
  }

  clear() {
    this.sprites.forEach(
      (sprite) => (sprite.texture.frame = this.makeTextureFrame(0, 0))
    );
  }

  private setSpriteTileIndex(sprite: Sprite, ti: number) {
    const [tx, ty] = this.tileCoords(ti);

    sprite.texture.frame = this.makeTextureFrame(tx, ty);
    sprite.texture.updateUvs();
  }

  private setSpriteTile(sprite: Sprite, tx: number, ty: number) {
    sprite.texture.frame = this.makeTextureFrame(tx, ty);
    sprite.texture.updateUvs();
  }

  private makeTextureFrame(x: number, y: number): Rectangle {
    const { tileWidth, tileHeight } = this.options;
    return new Rectangle(
      x * tileWidth!,
      y * tileHeight!,
      tileWidth,
      tileHeight
    );
  }

  private updateAnimatedTiles() {
    Object.keys(this.animations).forEach((baseTile) => {
      const bt = Number.parseInt(baseTile);

      const [first, ...rest] = this.animations[bt];
      this.animations[bt] = [...rest, first];

      this.sprites.forEach((sprite) => {
        const ti = this.tileIndexForSprite(sprite);

        if (this.animations[bt].includes(ti)) {
          this.setSpriteTileIndex(sprite, this.animations[bt][0]);
        }
      });
    });
  }

  private tileIndexForSprite(sprite: Sprite) {
    return this.tileIndex(
      sprite.texture.frame.x / this.options.tileWidth!,
      sprite.texture.frame.y / this.options.tileHeight!
    );
  }

  /**
   * Convert x, y position in the tilemap to a sprite array index
   */
  private mapIndex(x: number, y: number): number {
    return y * this.options.mapWidth! + x;
  }

  /**
   * Convert tilemap index to x, y position
   */
  private mapCoords(index: number): [number, number] {
    return [
      index % this.options.mapWidth!,
      Math.floor(index / this.options.mapHeight!),
    ];
  }

  /**
   * Convert x, y position in the tilesheet to a tile index
   */
  private tileIndex(x: number, y: number): number {
    return y * this.options.tileWidth! + x;
  }

  /**
   * Convert tile index to x, y position in the tilesheet
   */
  private tileCoords(index: number): [number, number] {
    return [
      index % this.options.tileWidth!,
      Math.floor(index / this.options.tileHeight!),
    ];
  }
}
