import type { Board } from '../Board';
import { Color } from '../Color';
import { PieceType } from '../PieceType';
import type { Square } from '../Square';
import { Piece } from './Piece';

/** Avanza uno (o dos desde su fila inicial) y captura en diagonal. Todavía sin coronación ni al paso. */
export class Pawn extends Piece {
  public getType(): PieceType {
    return PieceType.PAWN;
  }

  public getMoves(from: Square, board: Board): Square[] {
    const forward = this.color === Color.WHITE ? 1 : -1;
    const startRank = this.color === Color.WHITE ? 1 : 6;
    const moves: Square[] = [];

    const oneStep = from.offset(0, forward);
    if (oneStep.isOnBoard() && board.isEmpty(oneStep)) {
      moves.push(oneStep);
      const twoSteps = from.offset(0, 2 * forward);
      if (from.rank === startRank && board.isEmpty(twoSteps)) moves.push(twoSteps);
    }

    for (const side of [-1, 1]) {
      const diagonal = from.offset(side, forward);
      if (diagonal.isOnBoard() && this.isEnemyAt(diagonal, board)) moves.push(diagonal);
    }
    return moves;
  }
}
