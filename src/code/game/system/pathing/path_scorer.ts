import { IAStarScorer } from '../../../lib/pathing/a_star_scorer';
import { GridNode } from './grid_node';

export class PathScorer implements IAStarScorer<GridNode> {
  estimate_cost(start: GridNode, end: GridNode): number {
    return Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
  }

  calculate_g(node: GridNode, parent: GridNode): number {
    return node.y === parent.y ? 1 : 10;
  }

  is_walkable(node: GridNode): boolean {
    return node.walkable;
  }
}
