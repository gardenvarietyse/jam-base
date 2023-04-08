import { KeyboardComponents } from './input/keyboard';
import { CharacterAnimatorComponents } from './character/animator';
import { PathFollowerComponents } from './character/path_follower';
import { SpriteComponents } from './graphics/sprite';
import { TilemapComponents } from './graphics/tilemap';
import { GridComponents } from './grid/grid';
import { SelectionComponents } from './ui/selection';
import { TaskManagerComponents } from './task/task_manager';
import { HealthComponents } from './health';
import { LabelComponents } from './graphics/label';
import { UtilComponents } from './util';
import { ConstructionComponents } from './ui/construction';
import { ResourceComponents } from './item/resource';
import { InventoryComponents } from './character/inventory';

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
  ResourceComponents &
  InventoryComponents &
  // graphics
  LabelComponents &
  TilemapComponents &
  // input
  KeyboardComponents &
  // ui
  SelectionComponents &
  ConstructionComponents &
  // general game systems
  GridComponents &
  TaskManagerComponents;
