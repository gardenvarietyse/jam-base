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
      const { x, sprite, pathing, task_agent } = entity;

      sprite.animation = pathing ? 'walk' : 'idle';
      if (task_agent?.tasks[0]?.state === 'active') {
        sprite.animation = 'work';
        const tx = task_agent.tasks[0]?.target?.x ?? x;

        sprite.flip_x = tx < x;
      }

      if (pathing?.path && pathing.path.length > 0) {
        const next_node = pathing.path[0];
        sprite.flip_x = next_node.x * 16 < x - 8;
      }
    }
  };
};
