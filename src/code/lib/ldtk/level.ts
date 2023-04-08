import { LDTKTileset } from '.';
import {
  ILDTKEntityLayerInstance,
  ILDTKLayer,
  ILDTKLevel,
  ILDTKTileLayer,
  ILDTKTileLayerInstance,
  LDTKDir,
} from './format';

type LDTKTileLayerInstance = ILDTKTileLayerInstance & {
  tileset: LDTKTileset;
};

export type LDTKLevelNeighbourSet = { [K in LDTKDir]?: LDTKLevel };

export type LDTKLevel = ILDTKLevel & {
  tileLayers: LDTKTileLayerInstance[];
  entityLayers: ILDTKEntityLayerInstance[];
  neighbours: LDTKLevelNeighbourSet;
};

const tilesetForLayer = (
  layer: ILDTKTileLayerInstance,
  layerDefs: ILDTKLayer[],
  tilesets: LDTKTileset[]
) => {
  const ldId = layer.layerDefUid;
  const def = layerDefs.find((ld) => ld.uid === ldId);
  if (!def) {
    return null;
  }

  const tlDef = def as ILDTKTileLayer;

  return tilesets.find((ts) => ts.uid === tlDef.tilesetDefUid);
};

export const parseLDTKLevel = (
  level: ILDTKLevel,
  layerDefs: ILDTKLayer[],
  tilesets: LDTKTileset[]
): LDTKLevel => {
  const tileLayers = level.layerInstances.filter(
    (li) => li.__type === 'Tiles'
  ) as ILDTKTileLayerInstance[];

  const entityLayers = level.layerInstances.filter(
    (li) => li.__type === 'Entities'
  ) as ILDTKEntityLayerInstance[];

  return {
    ...level,
    tileLayers: tileLayers.map((tl) => ({
      ...tl,
      // yeah
      tileset: tilesetForLayer(tl, layerDefs, tilesets)!,
    })),
    entityLayers,
    neighbours: {},
  };
};

// assumption for now: only one neighbour per direction
export const getLevelNeighbourSet = (level: LDTKLevel, levels: LDTKLevel[]) =>
  level.__neighbours.reduce(
    (ns, n) => ({
      ...ns,
      [n.dir]: levels.find((l) => l.iid === n.levelIid),
    }),
    {}
  );
