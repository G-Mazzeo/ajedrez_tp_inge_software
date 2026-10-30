import type { Color } from '../Color';
import { SlideMovement } from '../movements/SlideMovement';
import { Bishop } from './Bishop';
import { Piece } from './Piece';
import { Rook } from './Rook';

/** La dama se desliza como torre y como alfil: reutiliza las direcciones de las dos. */
export class Queen extends Piece {
  constructor(color: Color) {
    super(color, new SlideMovement([...Rook.DIRECTIONS, ...Bishop.DIRECTIONS]));
  }

  public getSymbol(): string {
    return 'Q';
  }
}
