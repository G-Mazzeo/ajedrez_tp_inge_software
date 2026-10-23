import { Color } from './Color';
import { Bishop } from './pieces/Bishop';
import { King } from './pieces/King';
import { Knight } from './pieces/Knight';
import { Pawn } from './pieces/Pawn';
import type { Piece } from './pieces/Piece';
import { PieceType } from './PieceType';
import { Queen } from './pieces/Queen';
import { Rook } from './pieces/Rook';
import { Square } from './Square';

/** Qué pieza hay en cada casilla. Solo guarda las casillas ocupadas. */
export class Board {
  // La clave es el nombre de la casilla ('e2'): dos objetos Square iguales serían claves distintas en un Map.
  private readonly pieces = new Map<string, Piece>();

  /** La posición inicial del ajedrez clásico. */
  public static initial(): Board {
    const board = new Board();
    const backRank = [Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook];
    backRank.forEach((PieceClass, file) => {
      board.place(new Square(file, 0), new PieceClass(Color.WHITE));
      board.place(new Square(file, 1), new Pawn(Color.WHITE));
      board.place(new Square(file, 6), new Pawn(Color.BLACK));
      board.place(new Square(file, 7), new PieceClass(Color.BLACK));
    });
    return board;
  }

  public pieceAt(square: Square): Piece | undefined {
    return this.pieces.get(square.name());
  }

  public isEmpty(square: Square): boolean {
    return !this.pieces.has(square.name());
  }

  public place(square: Square, piece: Piece): void {
    this.pieces.set(square.name(), piece);
  }

  /** Mueve la pieza sin validar nada: las reglas las controla Game. */
  public move(from: Square, to: Square): void {
    const piece = this.pieceAt(from);
    if (!piece) throw new Error(`No hay pieza en ${from.name()}`);
    this.pieces.delete(from.name());
    this.pieces.set(to.name(), piece);
  }

  public entries(): [Square, Piece][] {
    return [...this.pieces].map(([name, piece]): [Square, Piece] => [Square.fromName(name), piece]);
  }

  public findKing(color: Color): Square | undefined {
    return this.entries().find(([, piece]) => piece.getType() === PieceType.KING && piece.getColor() === color)?.[0];
  }

  /** ¿Alguna pieza de `attacker` puede llegar a esta casilla? */
  public isAttackedBy(square: Square, attacker: Color): boolean {
    return this.entries().some(
      ([from, piece]) =>
        piece.getColor() === attacker && piece.getMoves(from, this).some((target) => target.equals(square)),
    );
  }

  /** Copia para simular un movimiento sin tocar este tablero. Las piezas no cambian, se pueden compartir. */
  public clone(): Board {
    const copy = new Board();
    for (const [square, piece] of this.entries()) copy.place(square, piece);
    return copy;
  }
}
