import { World } from 'miniplex';
import { GameEntity } from './entity';

export type SystemRunFn = (delta: number) => void;

export const addSystemCleanup = (
  world: World<GameEntity>,
  state_component: keyof GameEntity,
  cleanup: (entity: GameEntity) => void
) => {
  world.onEntityRemoved.add((entity) => {
    if (entity[state_component]) {
      setTimeout(() => cleanup(entity), 0);
    }
  });
};

export const initSystems =
  (systems: SystemRunFn[]): SystemRunFn =>
  (delta) =>
    systems.forEach((s) => s(delta));
