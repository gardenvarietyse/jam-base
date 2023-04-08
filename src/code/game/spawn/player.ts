import { World } from 'miniplex';
import { ILDTKEntityInstance } from '../../lib/ldtk/format';
import { GameEntity } from '../system/entity';
import { Asset } from '../../../asset';
import { make_body } from '../system/blomp/blomp';

export const spawnPlayer = (
  world: World<GameEntity>,
  definition: ILDTKEntityInstance
) => {
  const [x, y] = definition.px;

  console.log(definition);

  const entity = world.add({
    x,
    y,
    sprite: {
      json_asset: Asset.sprite.character.shade,
    },
    body: make_body(16, 16),
    character_animator: true,
  });

  return entity;
};