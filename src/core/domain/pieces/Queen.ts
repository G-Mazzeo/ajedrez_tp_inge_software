import type { Board } from '../Board';
import { PieceType } from '../PieceType';
import type { Square } from '../Square';
import { type Direction, Piece } from './Piece';

export class Queen extends Piece {
  private static readonly DIRECTIONS: readonly Direction[] = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

  public getType(): PieceType {
    return PieceType.QUEEN;
  }

  public getMoves(from: Square, board: Board): Square[] {
    return this.slide(from, board, Queen.DIRECTIONS);
  }
}
