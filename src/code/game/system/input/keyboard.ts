import { World } from 'miniplex';
import Keyboard from '../../../lib/keyboard';
import { SystemRunFn, addSystemCleanup } from '..';
import { GameEntity } from '../entity';

export type KeyboardComponents = {
  keyboard?: {
    keys: string[];
    held?: (keyCode: string) => void;
    pressed?: (keyCode: string) => void;
  };
  keyboard_instance?: Keyboard;
};

export const createKeyboardSystem = (world: World<GameEntity>): SystemRunFn => {
  const cleanup = (entity: GameEntity) => {
    entity.keyboard_instance?.removeListeners();
    world.removeComponent(entity, 'keyboard_instance');
  };

  const added = world.with('keyboard').without('keyboard_instance');
  const active = world.with('keyboard', 'keyboard_instance');
  const removed = world.with('keyboard_instance').without('keyboard');

  addSystemCleanup(world, 'keyboard_instance', cleanup);

  return (delta: number) => {
    for (const entity of added) {
      const keyboard = new Keyboard();
      keyboard.addListeners();

      world.addComponent(entity, 'keyboard_instance', keyboard);
    }

    for (const entity of active) {
      const { keyboard, keyboard_instance } = entity;

      keyboard.keys.forEach((k) => {
        keyboard_instance.held(k) && keyboard.held?.(k);
        keyboard_instance.pressed(k) && keyboard.pressed?.(k);
      });
    }

    for (const entity of removed) {
      cleanup(entity);
    }
  };
};
