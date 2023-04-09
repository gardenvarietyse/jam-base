import { NoResponse, ResponseFn } from '../../../lib/blomp/response';
import { Body, CollisionData, World as BlompWorld } from '../../../lib/blomp';
import { SystemRunFn, addSystemCleanup } from '..';
import { GameEntity } from '../entity';
import { With, World } from 'miniplex';
import { lerp } from '../../../lib/math';

type CollisionEvent = (body: Body, collision: CollisionData) => void;
// todo: make gravity configurable
export const FALL_SPEED = 200;

type BodyComponent = {
  width: number;
  height: number;

  velocity_x: number;
  velocity_y: number;

  can_push: boolean;
  pushable: boolean;

  grounded: boolean;

  static: boolean;
  platform: boolean;
  ghost: boolean;
  trigger: boolean;
  ignore_gravity: boolean;

  response?: ResponseFn;

  groups: string[];
  ignore_groups: string[];

  overlap?: CollisionEvent;
};

export type BlompComponents = {
  body?: BodyComponent;
  body_state?: {
    instance: Body;
  };
};

type BodyComponentAttributes = Partial<
  Omit<Omit<BodyComponent, 'height'>, 'width'>
>;

export const make_body = (
  width: number,
  height: number,
  attributes: BodyComponentAttributes = {}
): BodyComponent => ({
  width,
  height,
  velocity_x: 0,
  velocity_y: 0,

  can_push: false,
  pushable: false,

  grounded: false,

  static: false,
  platform: false,
  ghost: false,
  trigger: false,
  ignore_gravity: false,

  groups: [],
  ignore_groups: [],

  ...attributes,
});

const apply_velocity = (
  world: BlompWorld,
  entity: GameEntity,
  instance: Body,
  delta: number
) => {
  const { body } = entity;

  if (!body.ignore_gravity) {
    if (body.grounded && body.velocity_y > 0) {
      body.velocity_y = 0;
    } else {
      body.velocity_y = lerp(body.velocity_y, FALL_SPEED, delta * 2);
    }
  }

  const target_x = instance.x + body.velocity_x * delta;
  const target_y = instance.y + body.velocity_y * delta;

  // prevent funky wall sliding glitch by moving one axis at a time
  const collisionsX = world.move(instance, target_x, instance.y, body.response);
  let collisions = world.move(instance, instance.x, target_y, body.response);

  if (body.ignore_gravity) {
    body.grounded = false;
  } else {
    if (
      collisions.some(
        (data) =>
          (data.normal_y === -1 || data.normal_y === 0) &&
          !data.other.trigger &&
          !data.other.ghost
      )
    ) {
      body.grounded = true;
    } else if (
      collisions.some(
        (data) =>
          data.normal_y === 1 && !data.other.trigger && !data.other.ghost
      )
    ) {
      body.velocity_y = 0;
    } else {
      if (
        world.move(instance, instance.x, instance.y + 1, NoResponse, true)
          .length === 0
      ) {
        body.grounded = false;
      }
    }
  }

  collisions = [...collisionsX, ...collisions];

  collisions.forEach((col) => {
    // temp hack so bullets collide with walls
    // maybe not relevant for this basecode
    body.overlap?.(col.other, {
      ...col,
      normal_x: col.normal_x * -1,
      normal_y: col.normal_y * -1,
    });

    col.other.data?.overlap?.(instance, col);
  });

  if (body.can_push && body.grounded) {
    const pushables = [...collisions].filter(
      (col) => col.other.data.pushable && col.normal_y === 0
    );

    pushables.forEach(({ other, target_x }) => {
      world.move(
        other,
        other.x + body.velocity_x * delta * 0.3,
        other.y,
        body.response
      );

      world.move(instance, target_x, instance.y, body.response);
    });
  }
};

export const createBlompSystem = (
  entity_world: World<GameEntity>,
  blomp_world: BlompWorld
): SystemRunFn => {
  const body_cleanup = (entity: GameEntity) => {
    const { body_state } = entity;
    blomp_world.remove(body_state.instance);
    entity_world.removeComponent(entity, 'body_state');
  };

  addSystemCleanup(entity_world, 'body_state', body_cleanup);

  return (delta: number) => {
    const added = entity_world.with('body').without('body_state');
    const active = entity_world.with('body', 'body_state');
    const removed = entity_world.with('body_state').without('body');

    for (const entity of added) {
      const { x, y, body } = entity;
      const instance = new Body(
        {
          entity,
        },
        x,
        y,
        body.width,
        body.height
      );

      instance.trigger = body.trigger;
      instance.groups = body.groups;
      instance.ignoreGroups = body.ignore_groups;
      instance.ghost = body.ghost;

      blomp_world.add(instance);

      entity_world.addComponent(entity, 'body_state', {
        instance,
      });
    }

    for (const entity of active) {
      const { body, body_state } = entity;

      if (!body.static && !body.trigger && !body_state.instance.freeze) {
        apply_velocity(blomp_world, entity, body_state.instance, delta);
      }

      entity.x = body_state.instance.x;
      entity.y = body_state.instance.y;
    }

    for (const entity of removed) {
      body_cleanup(entity);
    }
  };
};
