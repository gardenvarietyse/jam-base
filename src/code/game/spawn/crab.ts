import { World } from 'miniplex';
import { ILDTKEntityInstance } from '../../lib/ldtk/format';
import { GameEntity } from '../system/entity';
import { Asset } from '../../../asset';
import { make_body } from '../system/blomp/blomp';
import { make_controller } from '../system/character/controller';

export const CRAB_WIDTH = 16;
export const CRAB_HEIGHT = 16;

export const spawnCrab = (
  world: World<GameEntity>,
  definition: ILDTKEntityInstance
) => {
  const [x, y] = definition.px;

  const entity = world.add({
    x,
    y,
    sprite: {
      json_asset: Asset.sprite.character.crab,
      offset_x: 8,
    },
    body: make_body(CRAB_WIDTH, CRAB_HEIGHT),
    character_animator: true,
    controller: make_controller(),
  });

  return entity;
};
