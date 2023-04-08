import { PathNode } from './path_node';

export interface IAStarScorer<T extends PathNode> {
  /**
   * Estimate the cost of traveling from <i>start</i> to <i>end</i> (the heuristic function). Only called when node is added to open list, so it should give the result for every call.
   *
   * @param start
   *            The start node
   * @param end
   *            The target node
   * @return The estimated cost of traveling from start to end
   */
  estimate_cost(start: T, end: T): number;

  /**
   * Calculate cost of passing through <i>node</i> via <i>parent</i>
   *
   * @param node
   * @param parent
   * @return
   */
  calculate_g(node: T, parent: T): number;

  /**
   * Determine whether the given node is walkable or not
   *
   * @param node
   *            The node to test for walkability
   * @return true if the given node is walkable; otherwise false
   */
  is_walkable(node: T): boolean;
}
