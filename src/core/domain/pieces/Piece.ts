import type { Board } from '../Board';
import type { Color } from '../Color';
import type { PieceType } from '../PieceType';
import type { Square } from '../Square';

/** [columnas, filas] que se desplaza una pieza en un paso. */
export type Direction = readonly [number, number];

/**
 * Una pieza. Cada subclase sabe cómo se mueve (polimorfismo):
 * Game le pide los movimientos sin saber qué pieza es.
 */
export abstract class Piece {
  protected readonly color: Color;

  constructor(color: Color) {
    this.color = color;
  }

  public getColor(): Color {
    return this.color;
  }

  public abstract getType(): PieceType;

  /** Casillas a las que la pieza puede ir desde `from`. Todavía no contempla jaque. */
  public abstract getMoves(from: Square, board: Board): Square[];

  /** Torre, alfil y dama: avanzan en cada dirección hasta chocar con algo. */
  protected slide(from: Square, board: Board, directions: readonly Direction[]): Square[] {
    const moves: Square[] = [];
    for (const [fileDelta, rankDelta] of directions) {
      let current = from.offset(fileDelta, rankDelta);
      while (current.isOnBoard() && board.isEmpty(current)) {
        moves.push(current);
        current = current.offset(fileDelta, rankDelta);
      }
      if (current.isOnBoard() && this.isEnemyAt(current, board)) moves.push(current);
    }
    return moves;
  }

  /** Rey y caballo: un solo salto en cada dirección. */
  protected jump(from: Square, board: Board, offsets: readonly Direction[]): Square[] {
    return offsets
      .map(([fileDelta, rankDelta]) => from.offset(fileDelta, rankDelta))
      .filter((square) => square.isOnBoard() && (board.isEmpty(square) || this.isEnemyAt(square, board)));
  }

  protected isEnemyAt(square: Square, board: Board): boolean {
    const other = board.pieceAt(square);
    return other !== undefined && other.getColor() !== this.color;
  }
}
