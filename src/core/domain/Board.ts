import type { Color } from './Color';
import type { Piece } from './pieces/Piece';
import { Square } from './Square';

/**
 * Qué pieza hay en cada casilla. Solo guarda las casillas ocupadas.
 * El tamaño se elige al crearlo (8x8 por defecto); cómo se llena lo decide un IBoardSetup.
 */
export class Board {
  private readonly files: number;
  private readonly ranks: number;
  // La clave es el nombre de la casilla ('e2'): dos objetos Square iguales serían claves distintas en un Map.
  private readonly pieces = new Map<string, Piece>();

  constructor(files: number = 8, ranks: number = 8) {
    this.files = files;
    this.ranks = ranks;
  }

  public getFiles(): number {
    return this.files;
  }

  public getRanks(): number {
    return this.ranks;
  }

  /** ¿La casilla está dentro de este tablero? */
  public contains(square: Square): boolean {
    return square.file >= 0 && square.file < this.files && square.rank >= 0 && square.rank < this.ranks;
  }

  public pieceAt(square: Square): Piece | undefined {
    return this.pieces.get(square.name());
  }

  public isEmpty(square: Square): boolean {
    return !this.pieces.has(square.name());
  }

  /** ¿Hay una pieza rival de `color` en la casilla? Lo usan las estrategias de movimiento para saber qué es captura. */
  public hasEnemy(square: Square, color: Color): boolean {
    const piece = this.pieceAt(square);
    return piece !== undefined && piece.getColor() !== color;
  }

  public place(square: Square, piece: Piece): void {
    if (!this.contains(square)) throw new Error(`${square.name()} está fuera del tablero`);
    this.pieces.set(square.name(), piece);
  }

  /** Mueve la pieza sin validar nada: las reglas las controla Game. */
  public move(from: Square, to: Square): void {
    const piece = this.pieceAt(from);
    if (!piece) throw new Error(`No hay pieza en ${from.name()}`);
    this.pieces.delete(from.name());
    this.place(to, piece);
  }

  public entries(): [Square, Piece][] {
    return [...this.pieces].map(([name, piece]): [Square, Piece] => [Square.fromName(name), piece]);
  }

  public findKing(color: Color): Square | undefined {
    return this.entries().find(([, piece]) => piece.isKing() && piece.getColor() === color)?.[0];
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
    const copy = new Board(this.files, this.ranks);
    for (const [square, piece] of this.entries()) copy.place(square, piece);
    return copy;
  }
}
