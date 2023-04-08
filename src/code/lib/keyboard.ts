export default class Keyboard {
  private keysHeld: { [key: string]: boolean } = {};
  private keysPressed: { [key: string]: boolean } = {};

  private target?: Document | HTMLElement;
  private keyDownListener;
  private keyUpListener;

  addListeners(target: Document | HTMLElement = document) {
    if (this.target) {
      throw new Error('Listeners already added, removeListeners() first');
    }

    this.target = target;

    const self = this;

    this.keyDownListener = function (event: KeyboardEvent) {
      if (event.repeat) {
        return;
      }

      self.keysHeld[event.key.toLowerCase()] = true;
    };

    this.keyUpListener = function (event: KeyboardEvent) {
      self.keysHeld[event.key.toLowerCase()] = false;
    };

    target.addEventListener('keydown', this.keyDownListener);
    target.addEventListener('keyup', this.keyUpListener);
  }

  removeListeners() {
    if (!this.target) {
      throw new Error('Listeners not added');
    }

    this.target.removeEventListener('keyup', this.keyUpListener);
    this.target.removeEventListener('keydown', this.keyDownListener);

    this.target = undefined;
    this.keysHeld = {};
    this.keysPressed = {};
  }

  held(keyCode: string): boolean {
    return !!this.keysHeld[keyCode];
  }

  pressed(keyCode: string): boolean {
    const held = this.held(keyCode);

    if (held) {
      if (this.keysPressed[keyCode]) {
        return false;
      }
      {
        this.keysPressed[keyCode] = true;
        return true;
      }
    } else {
      this.keysPressed[keyCode] = false;
      return false;
    }
  }
}
