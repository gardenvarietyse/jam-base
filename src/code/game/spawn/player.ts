import { World } from 'miniplex';
import { ILDTKEntityInstance } from '../../lib/ldtk/format';
import { GameEntity } from '../system/entity';
import { Asset } from '../../../asset';
import { make_body } from '../system/blomp/blomp';
import { make_controller } from '../system/character/controller';
import { make_keyboard_controller } from '../system/character/keyboard';

export const PLAYER_WIDTH = 16;
export const PLAYER_HEIGHT = 16;

export const spawnPlayer = (
  world: World<GameEntity>,
  definition: ILDTKEntityInstance
) => {
  const [x, y] = definition.px;

  const entity = world.add({
    x,
    y,
    sprite: {
      json_asset: Asset.sprite.character.shade,
      offset_x: 8,
    },
    body: make_body(PLAYER_WIDTH, PLAYER_HEIGHT, {
      groups: ['player'],
    }),
    character_animator: true,
    controller: make_controller(),
    keyboard_controller: make_keyboard_controller(),
  });

  return entity;
};
