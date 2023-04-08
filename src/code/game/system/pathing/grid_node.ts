import { PathNode } from '../../../lib/pathing/path_node';
import { GameEntity } from '../entity';

export class GridNode extends PathNode {
  x: number;
  y: number;
  walkable = true;
  occupant?: GameEntity;

  constructor(x: number, y: number) {
    super();

    this.x = x;
    this.y = y;
  }
}
