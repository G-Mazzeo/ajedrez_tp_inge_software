import type { Board } from '../Board';
import type { Square } from '../Square';
import { type Direction, Piece } from './Piece';

export class King extends Piece {
  /** Públicas para que una pieza nueva pueda combinarlas (ej. caballo + alfil). */
  public static readonly OFFSETS: readonly Direction[] = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

  public getSymbol(): string {
    return 'K';
  }

  public isKing(): boolean {
    return true;
  }

  public getMoves(from: Square, board: Board): Square[] {
    return this.jump(from, board, King.OFFSETS);
  }
}
