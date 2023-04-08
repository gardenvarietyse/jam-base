import {
  AnimatedSprite,
  BaseTexture,
  Container,
  EventMode,
  FederatedEventHandler,
  FederatedPointerEvent,
  MIPMAP_MODES,
  Rectangle,
  SCALE_MODES,
  Texture,
} from 'pixi.js';

type AnimationMap = { [key: string]: AnimatedSprite };
export interface IAsepriteDefinition {
  data: { [key: string]: any };
  sprite: string;
}

export interface IAsepriteFrameTag {
  name: string;
  from: number;
  to: number;
  direction: string;
}

const generateAnimations = (def: IAsepriteDefinition): AnimationMap => {
  const { sprite, data } = def;
  const { meta } = data;

  if (meta.app !== 'https://www.aseprite.org/') {
    throw 'Invalid asesprite format';
  }

  const texture = BaseTexture.from(sprite);
  texture.mipmap = MIPMAP_MODES.OFF;
  texture.scaleMode = SCALE_MODES.NEAREST;

  const frames = Object.keys(data.frames).map((key) => {
    const { frame, duration } = data.frames[key];
    const { x, y, w, h } = frame;

    return {
      texture: new Texture(texture, new Rectangle(x, y, w, h)),
      time: duration,
    };
  });

  // todo: if no frame tags exist,
  // turn all frames into one default animation
  const animations = meta.frameTags.reduce(
    (result: Array<AnimatedSprite>, tag: IAsepriteFrameTag) => {
      const { name, from, to } = tag;
      const input = frames.slice(from, to + 1);

      const sprite = new AnimatedSprite(input);

      sprite.gotoAndStop(0);
      sprite.roundPixels = true;

      return {
        ...result,
        [name]: sprite,
      };
    },
    {}
  );

  return animations;
};

export class Aseprite extends Container {
  private _currentAnimation: string;
  private sprite: AnimatedSprite;
  private animations: AnimationMap;

  override get onpointertap() {
    return this.sprite.onpointertap;
  }

  override set onpointertap(
    handler: FederatedEventHandler<FederatedPointerEvent> | null
  ) {
    Object.keys(this.animations).forEach(
      (k) =>
        (this.animations[k].onpointertap = (e) => {
          if (e.currentTarget === this && this.animations[k] === this.sprite) {
            handler?.(e);
          }
        })
    );
  }

  // get eventMode() {
  //   return this.sprite.eventMode;
  // }

  // set eventMode(mode: EventMode) {
  //   Object.keys(this.animations).forEach(
  //     (k) => (this.animations[k].eventMode = mode)
  //   );
  // }

  private _w: number;
  private _h: number;

  override get width() {
    return this._w;
  }

  override get height() {
    return this._h;
  }

  onLoop?: (animation: string) => void;

  get anchor_x() {
    return this.sprite.anchor.x;
  }

  set anchor_x(value: number) {
    Object.keys(this.animations).forEach(
      (k) => (this.animations[k].anchor.x = value)
    );
  }

  get anchor_y() {
    return this.sprite.anchor.y;
  }

  set anchor_y(value: number) {
    Object.keys(this.animations).forEach(
      (k) => (this.animations[k].anchor.y = value)
    );
  }

  get tint() {
    return this.sprite?.tint;
  }

  set tint(t: number) {
    Object.keys(this.animations).forEach((k) => (this.animations[k].tint = t));
  }

  get currentAnimation(): string {
    return this._currentAnimation;
  }

  constructor(def: IAsepriteDefinition) {
    super();

    this.animations = generateAnimations(def);

    const defaultAnimation = Object.keys(this.animations)[0];
    const defaultAnimationSprite = this.animations[defaultAnimation];

    if (!defaultAnimationSprite) {
      console.warn(`${def.sprite} has no animations`);
      return;
    }

    this._w = defaultAnimationSprite.width;
    this._h = defaultAnimationSprite.height;

    this.pivot.x = this._w / 2;

    this.setAnimation(defaultAnimation);
  }

  destroy() {
    Object.keys(this.animations).forEach((k) => this.animations[k].destroy());
  }

  setAnimation(name: string) {
    if (name === this._currentAnimation) {
      return;
    }

    const sprite = this.animations[name];

    if (!sprite) {
      console.warn(`Animation ${name} not found`);
      return;
    }

    if (this.sprite) {
      this.removeChild(this.sprite);
      this.sprite.gotoAndStop(0);
      this.sprite.onLoop = undefined;
    }

    this._currentAnimation = name;
    this.sprite = sprite;
    this.addChild(sprite);

    this.sprite.gotoAndPlay(0);
    this.sprite.onLoop = () => {
      this.onLoop?.(name);
    };
  }
}
