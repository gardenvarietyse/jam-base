import { getLevelNeighbourSet, LDTKLevel, parseLDTKLevel } from './level';
import { ILDTKEntityInstance, ILDTKTileset, ILDTKWorld } from './format';

export type LDTKTileset = ILDTKTileset & {
  tilesForEnum: (value: string) => number[];
};

export type LDTKWorld = Omit<ILDTKWorld, 'levels'> & {
  tilesets: LDTKTileset[];
  tilesetById: (id: number) => LDTKTileset | undefined;
  levels: LDTKLevel[];
};

export const parseLDTKWorld = (world: ILDTKWorld): LDTKWorld => {
  const tilesets: LDTKTileset[] = world.defs.tilesets.map((t) => ({
    ...t,
    tilesForEnum: (value: string) =>
      t.enumTags.find((et) => et.enumValueId === value)?.tileIds || [],
  }));

  const tilesetById = (id: number) => tilesets.find((ts) => ts.uid === id);

  const levels = world.levels.map((l) =>
    parseLDTKLevel(l, world.defs.layers, tilesets)
  );
  levels.forEach((l) => (l.neighbours = getLevelNeighbourSet(l, levels)));

  return {
    ...world,
    tilesets,
    tilesetById,
    levels,
  };
};

export type SimpleEntity<T> = {
  identifier: string;
  iid: string;
  x: number;
  y: number;
  meta: T;
};

export const simplifyEntity = <T extends object>(
  entity: ILDTKEntityInstance
): SimpleEntity<T> => {
  const meta = entity.fieldInstances.reduce(
    (m, field) => ({
      ...m,
      [field.__identifier]: field.__value,
    }),
    {}
  ) as T;

  const [px, py] = entity.__pivot;

  const ox = entity.width * px;
  const oy = entity.height * py;

  return {
    identifier: entity.__identifier,
    iid: entity.iid,
    x: entity.px[0] - ox,
    y: entity.px[1] - oy,
    meta,
  };
};
