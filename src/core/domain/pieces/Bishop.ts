import type { Board } from '../Board';
import { PieceType } from '../PieceType';
import type { Square } from '../Square';
import { type Direction, Piece } from './Piece';

export class Bishop extends Piece {
  private static readonly DIRECTIONS: readonly Direction[] = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

  public getType(): PieceType {
    return PieceType.BISHOP;
  }

  public getMoves(from: Square, board: Board): Square[] {
    return this.slide(from, board, Bishop.DIRECTIONS);
  }
}
