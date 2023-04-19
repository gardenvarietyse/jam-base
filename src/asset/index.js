import * as shade_json from './sprite/character/shade.json';
import * as shade_sprite from 'url:./sprite/character/shade.png';

import * as crab_json from './sprite/character/crab.json';
import * as crab_sprite from 'url:./sprite/character/crab.png';

import * as air from 'url:./sprite/util/air.png';
import * as ground from 'url:./sprite/util/ground.png';
import * as path from 'url:./sprite/util/path.png';

import * as tiles from 'url:./tiles.png';

export const Asset = {
  tiles,
  sprite: {
    character: {
      shade: {
        data: shade_json,
        sprite: shade_sprite,
      },
      crab: {
        data: crab_json,
        sprite: crab_sprite,
      },
    },
    util: {
      air,
      ground,
      path,
    },
  },
};
