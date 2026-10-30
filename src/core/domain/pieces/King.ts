import type { Color } from '../Color';
import type { Direction } from '../movements/IMovementStrategy';
import { JumpMovement } from '../movements/JumpMovement';
import { Piece } from './Piece';

export class King extends Piece {
  /** Públicas para que una pieza nueva pueda combinarlas (ej. caballo + alfil). */
  public static readonly OFFSETS: readonly Direction[] = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

  constructor(color: Color) {
    super(color, new JumpMovement(King.OFFSETS));
  }

  public getSymbol(): string {
    return 'K';
  }

  public isKing(): boolean {
    return true;
  }
}
