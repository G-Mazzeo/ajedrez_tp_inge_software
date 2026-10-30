import type { Board } from '../Board';
import type { Color } from '../Color';
import type { IMovementStrategy } from '../movements/IMovementStrategy';
import type { Square } from '../Square';

/** Una clase de pieza concreta: con el color alcanza para crearla (ej. `Queen` al coronar). */
export type PieceClass = new (color: Color) => Piece;

/**
 * Una pieza. Herencia para lo que la pieza ES (su letra, si es rey, si corona);
 * composición para cómo SE MUEVE: cada subclase le pasa una estrategia (IMovementStrategy) y getMoves le delega.
 * Game y Board le piden los movimientos sin saber qué pieza es ni qué estrategia usa.
 */
export abstract class Piece {
  private readonly color: Color;
  private readonly movement: IMovementStrategy;

  constructor(color: Color, movement: IMovementStrategy) {
    this.color = color;
    this.movement = movement;
  }

  public getColor(): Color {
    return this.color;
  }

  /** Letra de la pieza en la notación del ajedrez (K, Q, R, B, N, P). La UI la usa para dibujarla. */
  public abstract getSymbol(): string;

  /** El jaque se calcula sobre el rey. Solo King lo cambia a true. */
  public isKing(): boolean {
    return false;
  }

  /** ¿Se cambia por otra pieza al llegar a la última fila? Solo Pawn lo cambia a true. */
  public canPromote(): boolean {
    return false;
  }

  /** Casillas a las que la pieza puede ir desde `from`. Todavía no contempla jaque. */
  public getMoves(from: Square, board: Board): Square[] {
    return this.movement.getMoves(from, board, this.color);
  }
}
