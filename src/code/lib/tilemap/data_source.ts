import { TileData } from './tilemap';

export type TilemapDataUpdate = (x: number, y: number, t: number) => void;

type TileResulOutOfBounds = {
  result: 'out_of_bounds';
};

type TileResultNone = {
  result: 'none';
};

type TileResultPresent = {
  result: 'present';
  tile: number;
};

export type TileResult =
  | TileResulOutOfBounds
  | TileResultNone
  | TileResultPresent;

export class TilemapDataSource {
  data: TileData;
  width: number;
  height: number;

  transform_tile?: (x: number, y: number, t: number) => number;

  get(x: number, y: number): TileResult {
    const index = y * this.width + x;
    if (index < 0 || index > this.width * this.height - 1) {
      console.warn(`TilemapDataSource.get: ${x}, ${y} is out of bounds`);
      return { result: 'out_of_bounds' };
    }

    const t = this.data[index];

    return t === undefined
      ? { result: 'none' }
      : { result: 'present', tile: t };
  }

  update(x: number, y: number, t: number) {
    const index = y * this.width + x;

    if (index < 0 || index > this.width * this.height - 1) {
      console.warn(`TilemapDataSource.update: ${x}, ${y} is out of bounds`);
      return;
    }

    const transformed_t = this.transform_tile?.(x, y, t) ?? t;
    this.data[index] = transformed_t;
    this._update_fns.forEach((fn) => fn(x, y, transformed_t));
  }

  on_update(fn: TilemapDataUpdate) {
    this._update_fns.push(fn);
  }

  private _update_fns: TilemapDataUpdate[] = [];

  constructor(width: number, height: number, data: TileData) {
    if (!width || !height || !data) {
      throw new Error('TilemapDataSource: some or all ctor args missing');
    }

    this.width = width;
    this.height = height;

    this.data = data;
  }
}
