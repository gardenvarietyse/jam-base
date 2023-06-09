import { World } from 'miniplex';
import { GameEntity, GameEntityWith } from '../entity';
import { lerp } from '../../../lib/math';
import { addSystemCleanup } from '..';

const JUMP_GRACE_TIME = 5 / 60;

export const make_controller = (): ControllerComponent => ({
  up: false,
  down: false,
  left: false,
  right: false,

  jump: false,

  move_speed: 64,
  jump_speed: 128 * 1.5,

  enabled: false,
});

type ControllerComponent = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;

  jump: boolean;

  move_speed: number;
  jump_speed: number;

  enabled: boolean;
};

export type CharacerControllerComponents = {
  controller?: ControllerComponent;

  controller_state?: {
    airtime: number;
    can_jump: boolean;
  };
};

export const createCharacterControllerSystem = (world: World<GameEntity>) => {
  const controller_cleanup = (entity: GameEntityWith<'controller_state'>) =>
    world.removeComponent(entity, 'controller_state');

  addSystemCleanup(world, 'controller_state', controller_cleanup);

  return (delta: number) => {
    const added = world.with('controller').without('controller_state');
    const active = world.with('controller', 'body', 'controller_state');
    const removed = world.with('controller_state').without('controller');

    for (const entity of added) {
      world.addComponent(entity, 'controller_state', {
        airtime: 0,
        can_jump: false,
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
        controller_state.can_jump &&
        jump &&
        controller_state.airtime <= JUMP_GRACE_TIME &&
        !body.ignore_gravity
      ) {
        body.velocity_y = -jump_speed;
        body.grounded = false;
        controller_state.can_jump = false;
      } else if (!jump && body.velocity_y < 0) {
        body.velocity_y /= 2;
      }

      if (body.grounded) {
        controller_state.airtime = 0;

        if (!jump) {
          controller_state.can_jump = true;
        }
      } else {
        controller_state.airtime += delta;
      }
    }

    for (const entity of removed) {
      controller_cleanup(entity);
    }
  };
};
