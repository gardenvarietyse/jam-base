import { World } from 'miniplex';
import { GameEntity, GameEntityWith } from '../entity';
import Keyboard from '../../../lib/keyboard';

export const make_keyboard_controller = () => ({
  up: 'i',
  down: 'k',
  left: 'j',
  right: 'l',

  jump: 'w',
});

export type KeyboardControllerComponent = {
  up: string;
  down: string;
  left: string;
  right: string;

  jump: string;
};

export type KeyboardControllerComponents = {
  keyboard_controller?: KeyboardControllerComponent;
  keyboard_controller_state?: {
    instance: Keyboard;
  };
};

export const createKeyboardControllerSystem = (world: World<GameEntity>) => {
  return (delta: number) => {
    const added = world
      .with('keyboard_controller')
      .without('keyboard_controller_state');
    const active = world.with(
      'controller',
      'keyboard_controller',
      'keyboard_controller_state'
    );
    const removed = world
      .with('keyboard_controller_state')
      .without('keyboard_controller');

    const keyboard_cleanup = (
      entity: GameEntityWith<'keyboard_controller_state'>
    ) => {
      const { instance } = entity.keyboard_controller_state;

      instance?.removeListeners();
      world.removeComponent(entity, 'keyboard_controller_state');
    };

    for (const entity of added) {
      const instance = new Keyboard();

      instance.addListeners();

      world.addComponent(entity, 'keyboard_controller_state', {
        instance,
      });
    }

    for (const entity of active) {
      const { keyboard_controller, keyboard_controller_state, controller } =
        entity;

      const { up, right, down, left, jump } = keyboard_controller;

      const inputs = [
        keyboard_controller_state.instance.held(left),
        keyboard_controller_state.instance.held(right),
        keyboard_controller_state.instance.held(up),
        keyboard_controller_state.instance.held(down),

        keyboard_controller_state.instance.held(jump),
      ];

      controller.left = inputs[0];
      controller.right = inputs[1];
      controller.up = inputs[2];
      controller.down = inputs[3];

      controller.jump = inputs[4];
    }

    for (const entity of removed) {
      keyboard_cleanup(entity);
    }
  };
};
