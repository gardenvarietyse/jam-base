export type Vector2 = [number, number];

export class Body {
  x: number;
  y: number;
  width: number;
  height: number;
  data: { [key: string]: any };
  trigger = false;
  freeze = false;
  groups: string[] = [];

  /**
   * If set, collide only with bodies in this group
   */
  collideGroups: string[];

  /**
   * Do not collide with groups in this list
   *
   * Unused if `collideGroups` is set
   */
  ignoreGroups: string[] = [];
  ghost = false;

  get right(): number {
    return this.x + this.width;
  }

  get bottom(): number {
    return this.y + this.height;
  }

  constructor(data: any, x: number, y: number, width: number, height: number) {
    if (width <= 0) {
      throw new Error('width must be non-zero');
    }

    if (height <= 0) {
      throw new Error('height must be non-zero');
    }

    this.data = data;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  shouldCollide(other: Body): boolean {
    if (!this.collideGroups) {
      return true;
    }

    return (
      this.collideGroups.filter((g) => other.groups.includes(g)).length > 0
    );
  }

  shouldIgnore(other: Body): boolean {
    return this.ignoreGroups.filter((g) => other.groups.includes(g)).length > 0;
  }

  overlaps(other: Body): boolean {
    const trivial =
      this.x < other.right &&
      this.right > other.x &&
      this.y < other.bottom &&
      this.bottom > other.y;

    return (
      trivial &&
      this.shouldCollide(other) &&
      !(this.shouldIgnore(other) || other.shouldIgnore(this))
    );
  }

  distance(other: Body): Vector2 {
    let dx = 0;
    let dy = 0;

    if (this.x < other.x) {
      dx = other.x - this.right;
    } else if (this.x > other.x) {
      dx = this.x - other.right;
    }

    if (this.y < other.y) {
      dy = other.y - this.bottom;
    } else if (this.y > other.y) {
      dy = this.y - other.bottom;
    }

    return [dx, dy];
  }
}
