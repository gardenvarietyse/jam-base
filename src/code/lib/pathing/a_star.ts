import { IAStarScorer } from './a_star_scorer';
import { PathNode } from './path_node';

export class AStar<T extends PathNode> {
  private open = new Set<T>();
  private closed = new Set<T>();

  scorer: IAStarScorer<T>;

  constructor(scorer: IAStarScorer<T>) {
    this.scorer = scorer;
  }

  get_path(from: T, to: T, check_neighbours = false): T[] | null {
    if (!this.scorer || !from || !to) {
      return null;
    }

    if (from === to) {
      return null;
    }

    // todo: need per-entity scorer to let
    // entities walk their own occupied node

    // if (!this.scorer.is_walkable(from)) {
    //   return null;
    // }

    let current: T | null = null;

    this.open.clear();
    this.closed.clear();

    this.open.add(from);
    from.h = this.scorer.estimate_cost(from, to);

    current = from;

    while (this.open.size !== 0) {
      current = this.find_lowest_score_node();

      this.open.delete(current as T);
      this.closed.add(current as T);

      if (current == to || !current) {
        break;
      }

      for (const n of current.neighbours) {
        if (!this.scorer.is_walkable(n as T) || this.closed.has(n as T)) {
          continue;
        }

        if (!this.open.has(n as T)) {
          this.open.add(n as T);
          n.h = this.scorer.estimate_cost(n as T, to);

          n.parent = current;
          n.g = current.g + this.scorer.calculate_g(n as T, current);
        } else {
          const ng = current.g + this.scorer.calculate_g(n as T, current);

          if (ng < n.g) {
            n.parent = current;
            n.g = ng;
          }
        }
      }
    }

    // If we found the target, build path
    if (current == to) {
      const result: T[] = [current];

      while (current.parent !== null && current.parent !== from) {
        result.unshift(current.parent as T);
        current = current.parent as T;
        if (!current) {
          return null;
        }
      }

      return result;
    }

    // no path found
    let neighbour_target_path: T[] | null = null;
    if (check_neighbours) {
      // todo: sort neighbours by distance
      // need to support generic distance function in PathNode

      const neighbours = [...to.neighbours];
      neighbours.sort((a, b) => {
        const cost_a = this.scorer.estimate_cost(from, a as T);
        const cost_b = this.scorer.estimate_cost(from, b as T);

        if (cost_a < cost_b) {
          return -1;
        } else if (cost_a > cost_b) {
          return 1;
        }

        return 0;
      });

      neighbours.forEach((neighbour, i) => {
        if (neighbour_target_path) {
          return;
        }

        neighbour_target_path = this.get_path(from, neighbour as T, false);
      });
    }

    return neighbour_target_path;
  }

  /**
   * Find the node in the open list with the lowest F score
   *
   * @return The node with the lowest F score, or null if the open list is empty
   */
  private find_lowest_score_node(): T | null {
    if (this.open.size === 0) {
      return null;
    }

    let s: T | null = null;

    for (const p of this.open) {
      if (s == null || p.get_f() < s.get_f()) {
        s = p;
      }
    }

    return s;
  }
}
