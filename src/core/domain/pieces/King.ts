import type { Board } from '../Board';
import { PieceType } from '../PieceType';
import type { Square } from '../Square';
import { type Direction, Piece } from './Piece';

export class King extends Piece {
  private static readonly OFFSETS: readonly Direction[] = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

  public getType(): PieceType {
    return PieceType.KING;
  }

  public getMoves(from: Square, board: Board): Square[] {
    return this.jump(from, board, King.OFFSETS);
  }
}
