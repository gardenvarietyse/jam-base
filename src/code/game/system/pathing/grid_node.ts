import { PathNode } from '../../../lib/pathing/path_node';

export class GridNode extends PathNode {
  x: number;
  y: number;
  block = false;
  in_air = false;

  constructor(x: number, y: number) {
    super();

    this.x = x;
    this.y = y;
  }
}
