/**
 most useful info from raw ldtk world format
 */

export interface ILDTKEnumTag {
  enumValueId: string;
  tileIds: number[];
}

export interface ILDTKEnum {
  identifier: string;
  uid: number;
  values: { id: string }[];
}

export interface ILDTKTileset {
  identifier: string;
  uid: number;
  relPath: string;
  tileGridSize: number;
  tagsSourceEnumUid: number;
  enumTags: ILDTKEnumTag[];
}

type LDTKIid = string;
export type LDTKDir = 'n' | 'e' | 's' | 'w';
type LDTKLayerType = 'IntGrid' | 'Entities' | 'Tiles' | 'AutoLayer';
type LDTKPixelCoords = [number, number];

type LDTKTileFlipNone = 0;
type LDTKTileFlipX = 1;
type LDTKTileFlipY = 2;
type LDTKTileFlipBoth = 3;

type LDTKTileFlip =
  | LDTKTileFlipNone
  | LDTKTileFlipX
  | LDTKTileFlipY
  | LDTKTileFlipBoth;

export interface ILDTKLevelNeighbour {
  levelIid: LDTKIid;
  dir: LDTKDir;
}

export interface ILDTKLayerInstance {
  __identifier: string;
  __type: LDTKLayerType;
  layerDefUid: number;
}

export interface ILDTKGridTile {
  px: LDTKPixelCoords;
  t: number;
  f: LDTKTileFlip;
  // undocumented, but appears to contain the tile index
  d: [number];
}

export interface ILDTKTileLayerInstance extends ILDTKLayerInstance {
  __type: 'Tiles';
  gridTiles: ILDTKGridTile[];
}

export interface ILDTKFieldInstance {
  __identifier: string;
  __value: string;
  __type: string;
}

export interface ILDTKEntityInstance {
  __identifier: string;
  iid: LDTKIid;

  px: LDTKPixelCoords;
  width: number;
  height: number;
  __pivot: [number, number];

  fieldInstances: ILDTKFieldInstance[];
}

export interface ILDTKEntityLayerInstance extends ILDTKLayerInstance {
  __type: 'Entities';
  entityInstances: ILDTKEntityInstance[];
}

export interface ILDTKLevel {
  identifier: string;
  iid: LDTKIid;

  worldX: number;
  worldY: number;

  pxWid: number;
  pxHei: number;

  bgColor: string;
  layerInstances: ILDTKLayerInstance[];
  __neighbours: ILDTKLevelNeighbour[];
}

export interface ILDTKLayer {
  __type: LDTKLayerType;
  uid: number;
}

export interface ILDTKTileLayer extends ILDTKLayer {
  __type: 'Tiles';
  tilesetDefUid: number;
}

export interface ILDTKWorld {
  defs: {
    layers: ILDTKLayer[];
    tilesets: ILDTKTileset[];
    enums: ILDTKEnum[];
  };
  levels: ILDTKLevel[];
}
