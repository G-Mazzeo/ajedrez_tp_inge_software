import type { Color } from '../Color';
import type { Direction } from '../movements/IMovementStrategy';
import { SlideMovement } from '../movements/SlideMovement';
import { Piece } from './Piece';

export class Bishop extends Piece {
  /** Públicas para que otra pieza pueda reutilizarlas (la dama, o una pieza nueva). */
  public static readonly DIRECTIONS: readonly Direction[] = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

  constructor(color: Color) {
    super(color, new SlideMovement(Bishop.DIRECTIONS));
  }

  public getSymbol(): string {
    return 'B';
  }
}
