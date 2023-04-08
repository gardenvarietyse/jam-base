import { KeyboardComponents } from './input/keyboard';
import { CharacterAnimatorComponents } from './character/animator';
import { PathFollowerComponents } from './character/path_follower';
import { SpriteComponents } from './graphics/sprite';
import { TilemapComponents } from './graphics/tilemap';
import { GridComponents } from './grid/grid';
import { HealthComponents } from './health';
import { LabelComponents } from './graphics/label';
import { UtilComponents } from './util';
import { LDTKComponents } from './ldtk/ldtk';
import { BlompComponents } from './blomp/blomp';
import { CharacerControllerComponents } from './character/controller';

export type GameEntity = {
  name?: string;

  x: number;
  y: number;
} & UtilComponents &
  // ingame entity stuff
  HealthComponents &
  SpriteComponents &
  CharacterAnimatorComponents &
  PathFollowerComponents &
  BlompComponents &
  CharacerControllerComponents &
  // graphics
  LabelComponents &
  TilemapComponents &
  // ldtk
  LDTKComponents &
  // input
  KeyboardComponents &
  // general game systems
  GridComponents;
