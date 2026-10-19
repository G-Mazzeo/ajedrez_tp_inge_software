/**
 * Una casilla del tablero. Value object: se compara por valor y nunca cambia.
 * file = columna (0..7 = a..h), rank = fila (0..7 = 1..8).
 */
export class Square {
  private static readonly FILES = 'abcdefgh';

  public readonly file: number;
  public readonly rank: number;

  constructor(file: number, rank: number) {
    this.file = file;
    this.rank = rank;
  }

  /** 'e2' -> Square(4, 1) */
  public static fromName(name: string): Square {
    return new Square(Square.FILES.indexOf(name[0]), Number(name[1]) - 1);
  }

  /** Square(4, 1) -> 'e2' */
  public name(): string {
    return `${Square.FILES[this.file]}${this.rank + 1}`;
  }

  public equals(other: Square): boolean {
    return this.file === other.file && this.rank === other.rank;
  }

  /** La casilla que está a cierta distancia de esta (puede quedar fuera del tablero). */
  public offset(fileDelta: number, rankDelta: number): Square {
    return new Square(this.file + fileDelta, this.rank + rankDelta);
  }

  public isOnBoard(): boolean {
    return this.file >= 0 && this.file < 8 && this.rank >= 0 && this.rank < 8;
  }
}
