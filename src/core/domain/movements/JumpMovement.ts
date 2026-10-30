import type { Board } from '../Board';
import type { Color } from '../Color';
import type { Square } from '../Square';
import type { Direction, IMovementStrategy } from './IMovementStrategy';

/** Rey y caballo: un solo salto en cada dirección, sin importar lo que haya en el medio. */
export class JumpMovement implements IMovementStrategy {
  private readonly offsets: readonly Direction[];

  constructor(offsets: readonly Direction[]) {
    this.offsets = offsets;
  }

  public getMoves(from: Square, board: Board, color: Color): Square[] {
    return this.offsets
      .map(([fileDelta, rankDelta]) => from.offset(fileDelta, rankDelta))
      .filter((square) => board.contains(square) && (board.isEmpty(square) || board.hasEnemy(square, color)));
  }
}
