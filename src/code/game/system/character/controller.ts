import { World } from 'miniplex';
import { GameEntity } from '../entity';
import { lerp } from '../../../lib/math';
import { addSystemCleanup } from '..';

const JUMP_GRACE_TIME = 5 / 60;

export const make_controller = (): ControllerComponent => ({
  up: false,
  down: false,
  left: false,
  right: false,

  use: false,
  jump: false,
  attack: false,
  cancel: false,

  move_speed: 64,
  jump_speed: 128,

  enabled: false,
});

type ControllerComponent = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;

  use: boolean;
  jump: boolean;
  attack: boolean;
  cancel: boolean;

  move_speed: number;
  jump_speed: number;

  enabled: boolean;
};

export type CharacerControllerComponents = {
  controller?: ControllerComponent;

  controller_state?: {
    airtime: number;
  };
};

export const createCharacterControllerSystem = (world: World<GameEntity>) => {
  const controller_cleanup = (entity: GameEntity) =>
    world.removeComponent(entity, 'controller_state');

  addSystemCleanup(world, 'controller_state', controller_cleanup);

  return (delta: number) => {
    const added = world.with('controller').without('controller_state');
    const active = world.with('controller', 'body', 'controller_state');
    const removed = world.with('controller_state').without('controller');

    for (const entity of added) {
      world.addComponent(entity, 'controller_state', {
        airtime: 0,
      });
    }

    for (const entity of active) {
      const { body, controller, controller_state } = entity;

      const { left, right, jump, move_speed, jump_speed } = controller;

      if (left) {
        body.velocity_x = -move_speed;
      } else if (right) {
        body.velocity_x = move_speed;
      } else {
        body.velocity_x = lerp(body.velocity_x, 0, delta * 20);
        if (Math.abs(body.velocity_x) <= controller.move_speed * 0.1) {
          body.velocity_x = 0;
        }
      }

      if (
        jump &&
        controller_state.airtime <= JUMP_GRACE_TIME &&
        !body.ignore_gravity
      ) {
        body.velocity_y = -jump_speed;
        body.grounded = false;
      }

      if (body.grounded) {
        controller_state.airtime = 0;
      } else {
        controller_state.airtime += delta;
      }
    }

    for (const entity of removed) {
      controller_cleanup(entity);
    }
  };
};
