import { World } from 'miniplex';
import { ILDTKEntityInstance } from '../../lib/ldtk/format';
import { spawnPlayer } from './player';
import { GameEntity } from '../system/entity';

export type EntitySpawnFn = (
  world: World<GameEntity>,
  definition: ILDTKEntityInstance
) => GameEntity;

const SPAWNERS: { [key: string]: EntitySpawnFn } = {
  Player: spawnPlayer,
};

export const spawnEntity = (
  world: World<GameEntity>,
  definition: ILDTKEntityInstance
): GameEntity | undefined => {
  const fn = SPAWNERS[definition.__identifier];

  if (!fn) {
    return undefined;
  }

  // todo: fix the fucking offset

  // const [px, py] = definition.__pivot;
  // const [x, y] = definition.px;

  // const ox = x - definition.width * px;
  // const oy = y - definition.height * py;

  // definition.px[0] = x - ox;
  // definition.px[1] = y - oy;
  return fn(world, definition);
};
