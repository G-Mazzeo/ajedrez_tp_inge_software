import type { Board } from '../Board';
import type { Square } from '../Square';
import { type Direction, Piece } from './Piece';

export class Knight extends Piece {
  /** Públicas para que una pieza nueva pueda combinarlas (ej. caballo + alfil). */
  public static readonly OFFSETS: readonly Direction[] = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];

  public getSymbol(): string {
    return 'N';
  }

  public getMoves(from: Square, board: Board): Square[] {
    return this.jump(from, board, Knight.OFFSETS);
  }
}
