import type { Board } from '../Board';
import type { Color } from '../Color';
import type { Square } from '../Square';
import type { Direction, IMovementStrategy } from './IMovementStrategy';

/** Torre, alfil y dama: avanza en cada dirección hasta chocar con algo. Si choca con un rival, lo puede capturar. */
export class SlideMovement implements IMovementStrategy {
  private readonly directions: readonly Direction[];

  constructor(directions: readonly Direction[]) {
    this.directions = directions;
  }

  public getMoves(from: Square, board: Board, color: Color): Square[] {
    const moves: Square[] = [];
    for (const [fileDelta, rankDelta] of this.directions) {
      let current = from.offset(fileDelta, rankDelta);
      while (board.contains(current) && board.isEmpty(current)) {
        moves.push(current);
        current = current.offset(fileDelta, rankDelta);
      }
      if (board.contains(current) && board.hasEnemy(current, color)) moves.push(current);
    }
    return moves;
  }
}
