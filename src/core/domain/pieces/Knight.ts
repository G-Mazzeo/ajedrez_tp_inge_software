import type { Color } from '../Color';
import type { Direction } from '../movements/IMovementStrategy';
import { JumpMovement } from '../movements/JumpMovement';
import { Piece } from './Piece';

export class Knight extends Piece {
  /** Públicas para que una pieza nueva pueda combinarlas (ej. caballo + alfil). */
  public static readonly OFFSETS: readonly Direction[] = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];

  constructor(color: Color) {
    super(color, new JumpMovement(Knight.OFFSETS));
  }

  public getSymbol(): string {
    return 'N';
  }
}
