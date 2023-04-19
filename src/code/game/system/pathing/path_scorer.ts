import { IAStarScorer } from '../../../lib/pathing/a_star_scorer';
import { GridNode } from './grid_node';

export class PathScorer implements IAStarScorer<GridNode> {
  estimate_cost(start: GridNode, end: GridNode): number {
    const base = Math.abs(start.x - end.x) + Math.abs(start.y - end.y);

    return base;
  }

  calculate_g(node: GridNode, parent: GridNode): number {
    if (node.in_air) {
      return 40;
    }

    if (node.x === parent.x && node.y > parent.y) {
      return 1;
    }

    return 20;
  }

  is_walkable(node: GridNode): boolean {
    return !node.block;
  }
}
