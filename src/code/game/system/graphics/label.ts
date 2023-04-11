import { World } from 'miniplex';
import { Container, Text } from 'pixi.js';
import { addSystemCleanup, SystemRunFn } from '..';
import { GameEntity, GameEntityWith } from '../entity';

export type LabelComponents = {
  label?: {
    text: string;
  };
  label_state?: {
    instance: Text;
  };
};

export const createLabelSystem = (
  world: World<GameEntity>,
  stage: Container
): SystemRunFn => {
  const sprite_cleanup = (entity: GameEntityWith<'label_state'>) => {
    entity.label_state.instance?.removeFromParent();

    world.removeComponent(entity, 'label_state');
  };

  const added = world.with('label').without('label_state');
  const active = world.with('label', 'label_state');
  const removed = world.with('label_state').without('label');

  addSystemCleanup(world, 'label_state', sprite_cleanup);

  return (delta: number) => {
    for (const entity of added) {
      const { x, y } = entity;
      const { text } = entity.label;

      const instance = new Text(text, {
        fill: 0xffffff,
        fontFamily: 'Courier New',
        fontSize: 6,
        fontWeight: 'bold',
        strokeThickness: 2,
      });

      instance.position.x = x;
      instance.position.y = y;
      instance.zIndex = 10000;

      stage.addChild(instance);
      world.addComponent(entity, 'label_state', {
        instance,
      });
    }

    for (const entity of active) {
      const { x, y } = entity;
      const { label, label_state } = entity;
      const { instance } = label_state;

      if (instance) {
        instance.position.x = x;
        instance.position.y = y;

        instance.text = label.text;
      }
    }

    for (const entity of removed) {
      sprite_cleanup(entity);
    }
  };
};
