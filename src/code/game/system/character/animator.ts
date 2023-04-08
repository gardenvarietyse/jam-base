import { World } from 'miniplex';
import { SystemRunFn } from '..';
import { GameEntity } from '../entity';

export type CharacterAnimatorComponents = {
  character_animator?: true;
};

export const createCharacterAnimatorSystem = (
  world: World<GameEntity>
): SystemRunFn => {
  const active = world.with('character_animator', 'sprite');

  return (delta: number) => {
    for (const entity of active) {
      const { x, sprite, pathing } = entity;

      sprite.animation = pathing ? 'walk' : 'idle';

      if (pathing?.path && pathing.path.length > 0) {
        const next_node = pathing.path[0];
        sprite.flip_x = next_node.x * 16 < x - 8;
      }
    }
  };
};
