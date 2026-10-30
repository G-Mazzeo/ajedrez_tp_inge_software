import type { Board } from '../Board';
import { Color } from '../Color';
import type { Square } from '../Square';
import type { IMovementStrategy } from './IMovementStrategy';

/** Avanza uno (o dos desde su fila inicial) y captura en diagonal. Todavía sin captura al paso. */
export class PawnMovement implements IMovementStrategy {
  public getMoves(from: Square, board: Board, color: Color): Square[] {
    const forward = color === Color.WHITE ? 1 : -1;
    // La segunda fila de cada lado, sea cual sea el tamaño del tablero.
    const startRank = color === Color.WHITE ? 1 : board.getRanks() - 2;
    const moves: Square[] = [];

    const oneStep = from.offset(0, forward);
    if (board.contains(oneStep) && board.isEmpty(oneStep)) {
      moves.push(oneStep);
      const twoSteps = from.offset(0, 2 * forward);
      if (from.rank === startRank && board.contains(twoSteps) && board.isEmpty(twoSteps)) moves.push(twoSteps);
    }

    for (const side of [-1, 1]) {
      const diagonal = from.offset(side, forward);
      if (board.contains(diagonal) && board.hasEnemy(diagonal, color)) moves.push(diagonal);
    }
    return moves;
  }
}
