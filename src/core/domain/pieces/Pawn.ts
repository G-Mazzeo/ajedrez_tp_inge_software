import type { Board } from '../Board';
import { Color } from '../Color';
import type { Square } from '../Square';
import { Piece } from './Piece';

/** Avanza uno (o dos desde su fila inicial) y captura en diagonal. Al llegar a la última fila corona (ver Game). Todavía sin al paso. */
export class Pawn extends Piece {
  public getSymbol(): string {
    return 'P';
  }

  public canPromote(): boolean {
    return true;
  }

  public getMoves(from: Square, board: Board): Square[] {
    const forward = this.color === Color.WHITE ? 1 : -1;
    // La segunda fila de cada lado, sea cual sea el tamaño del tablero.
    const startRank = this.color === Color.WHITE ? 1 : board.getRanks() - 2;
    const moves: Square[] = [];

    const oneStep = from.offset(0, forward);
    if (board.contains(oneStep) && board.isEmpty(oneStep)) {
      moves.push(oneStep);
      const twoSteps = from.offset(0, 2 * forward);
      if (from.rank === startRank && board.contains(twoSteps) && board.isEmpty(twoSteps)) moves.push(twoSteps);
    }

    for (const side of [-1, 1]) {
      const diagonal = from.offset(side, forward);
      if (board.contains(diagonal) && this.isEnemyAt(diagonal, board)) moves.push(diagonal);
    }
    return moves;
  }
}
