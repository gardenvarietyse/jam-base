import { World } from 'miniplex';
import { SystemRunFn } from '..';
import { GameEntity } from '../entity';

export type CharacterAnimatorComponents = {
  character_animator?: true;
};

export const createCharacterAnimatorSystem = (
  world: World<GameEntity>
): SystemRunFn => {
  const active = world.with('character_animator', 'sprite', 'body');

  return (delta: number) => {
    for (const entity of active) {
      const { sprite, body } = entity;

      if (body.grounded) {
        sprite.animation = Math.abs(body.velocity_x) > 0.01 ? 'run' : 'idle';
      } else {
        sprite.animation = body.velocity_y < 0 ? 'jump' : 'fall';
      }
    }
  };
};
