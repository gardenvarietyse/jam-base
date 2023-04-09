import { World } from 'miniplex';
import { Container, MIPMAP_MODES, SCALE_MODES, Sprite, Texture } from 'pixi.js';
import { addSystemCleanup, SystemRunFn } from '..';
import { Aseprite, IAsepriteDefinition } from '../../../lib/aseprite';
import { nrandom } from '../../../lib/math';
import { GameEntity } from '../entity';

export type SpriteComponents = {
  sprite?: {
    asset?: string;
    json_asset?: IAsepriteDefinition;
    animation?: string;

    flip_x?: boolean;
    z_index?: number;

    offset_x: number;

    shake?: number;
  };
  sprite_state?: {
    aseprite_instance?: Aseprite;
    instance?: Container;
  };
};

export const createSpriteSystem = (
  world: World<GameEntity>,
  stage: Container
): SystemRunFn => {
  const sprite_cleanup = (entity: GameEntity) => {
    if (entity.sprite_state?.instance) {
      entity.sprite_state?.instance?.removeFromParent();
    } else if (entity.sprite_state?.aseprite_instance) {
      entity.sprite_state?.aseprite_instance?.removeFromParent();
    }

    world.removeComponent(entity, 'sprite_state');
  };

  const added = world.with('sprite').without('sprite_state');
  const active = world.with('sprite', 'sprite_state');
  const removed = world.with('sprite_state').without('sprite');

  addSystemCleanup(world, 'sprite_state', sprite_cleanup);

  return (delta: number) => {
    for (const entity of added) {
      const { x, y, sprite } = entity;
      const { asset, json_asset, animation, z_index, flip_x } = sprite;

      if (asset && json_asset) {
        world.removeComponent(entity, 'sprite');
        throw new Error('Sprite cannot have both asset and json_asset');
      }

      if (asset) {
        // static sprite
        const texture = Texture.from(asset);
        texture.baseTexture.mipmap = MIPMAP_MODES.OFF;
        texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;

        const instance = new Sprite(texture);
        instance.roundPixels = true;

        const ox = instance.width * sprite.offset_x;
        instance.position.x = x + ox;
        instance.position.y = y;
        instance.zIndex = z_index ?? instance.zIndex;

        stage.addChild(instance);
        world.addComponent(entity, 'sprite_state', {
          instance,
        });
      } else if (json_asset) {
        // animated sprite
        const instance = new Aseprite(json_asset);

        const ox = instance.width * sprite.offset_x;

        instance.position.x = x + ox;
        instance.position.y = y;

        instance.scale.x = flip_x ? -1 : 1;
        instance.zIndex = z_index ?? instance.zIndex;

        if (animation) {
          instance.setAnimation(animation);
        } else {
          entity.sprite.animation = instance.currentAnimation;
        }

        stage.addChild(instance);

        world.addComponent(entity, 'sprite_state', {
          aseprite_instance: instance,
        });
      } else {
        world.removeComponent(entity, 'sprite');
        throw new Error('Sprite has no asset or json_asset');
      }
    }

    for (const entity of active) {
      const { x, y } = entity;
      const { sprite, sprite_state } = entity;
      const { instance, aseprite_instance } = sprite_state;

      if (sprite.shake) {
        sprite.shake = Math.max(0, sprite.shake - delta);
      }

      const shake_x = (sprite.shake || 0) * nrandom() * 2;
      const shake_y = (sprite.shake || 0) * nrandom() * 2;

      if (instance) {
        const ox = instance.width * sprite.offset_x;
        instance.position.x = x + sprite.offset_x + ox + shake_x;
        instance.position.y = y + shake_y;
        instance.scale.x = sprite.flip_x ? -1 : 1;
        instance.zIndex = sprite.z_index ?? instance.zIndex;
      } else if (aseprite_instance) {
        aseprite_instance.position.x = x + sprite.offset_x + shake_x;
        aseprite_instance.position.y = y + shake_y;
        aseprite_instance.scale.x = sprite.flip_x ? -1 : 1;
        aseprite_instance.zIndex = sprite.z_index ?? aseprite_instance.zIndex;

        if (
          sprite.animation !== aseprite_instance.currentAnimation &&
          sprite.animation !== undefined
        ) {
          aseprite_instance.setAnimation(sprite.animation);
        }
      }
    }

    for (const entity of removed) {
      sprite_cleanup(entity);
    }
  };
};
