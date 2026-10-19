import type { Board } from '../Board';
import { PieceType } from '../PieceType';
import type { Square } from '../Square';
import { type Direction, Piece } from './Piece';

export class Knight extends Piece {
  private static readonly OFFSETS: readonly Direction[] = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];

  public getType(): PieceType {
    return PieceType.KNIGHT;
  }

  public getMoves(from: Square, board: Board): Square[] {
    return this.jump(from, board, Knight.OFFSETS);
  }
}
