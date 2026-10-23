/**
 * Una casilla. Value object: se compara por valor y nunca cambia.
 * file = columna (0 = a, 1 = b, ...), rank = fila (0 = 1, 1 = 2, ...).
 * No sabe si está dentro del tablero: eso depende del tamaño, y lo responde Board.
 */
export class Square {
  private static readonly NAME = /^([a-z])(\d+)$/;

  public readonly file: number;
  public readonly rank: number;

  constructor(file: number, rank: number) {
    this.file = file;
    this.rank = rank;
  }

  /** 'e2' -> Square(4, 1). También sirve para tableros grandes: 'j10' -> Square(9, 9). */
  public static fromName(name: string): Square {
    const match = Square.NAME.exec(name);
    if (!match) throw new Error(`Nombre de casilla inválido: ${name}`);
    return new Square(match[1].charCodeAt(0) - 'a'.charCodeAt(0), Number(match[2]) - 1);
  }

  /** Square(4, 1) -> 'e2' */
  public name(): string {
    return `${String.fromCharCode('a'.charCodeAt(0) + this.file)}${this.rank + 1}`;
  }

  public equals(other: Square): boolean {
    return this.file === other.file && this.rank === other.rank;
  }

  /** La casilla que está a cierta distancia de esta (puede quedar fuera del tablero). */
  public offset(fileDelta: number, rankDelta: number): Square {
    return new Square(this.file + fileDelta, this.rank + rankDelta);
  }
}
