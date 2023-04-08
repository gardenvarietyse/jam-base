import * as shade_json from './sprite/character/shade.json';
import * as shade_sprite from 'url:./sprite/character/shade.png';

import * as tiles from 'url:./tiles.png';

export const Asset = {
  tiles,
  sprite: {
    character: {
      shade: {
        data: shade_json,
        sprite: shade_sprite,
      },
    },
  },
};
