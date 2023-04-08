export class PathNode {
  private _neighbours: PathNode[] = [];

  get neighbours() {
    return this._neighbours;
  }

  parent: PathNode;

  g = 0;
  h = 0;

  add_neighbour(node: PathNode) {
    if (node) {
      this.neighbours.push(node);
    }
  }

  public get_f(): number {
    return this.g + this.h;
  }
}
