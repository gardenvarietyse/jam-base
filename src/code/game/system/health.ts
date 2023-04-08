import { World } from 'miniplex';
import { SystemRunFn } from '.';
import { GameEntity } from './entity';

export type HealthComponents = {
  health?: {
    hp: number;
    on_death?: (entity: GameEntity) => void;
  };
};

export const createHealthSystem = (world: World<GameEntity>): SystemRunFn => {
  const active = world.with('health');

  return (delta: number) => {
    for (const entity of active) {
      const { health } = entity;

      if (health.hp <= 0) {
        health.on_death?.(entity);
        world.removeComponent(entity, 'health');
      }
    }
  };
};
