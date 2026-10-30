import type { Color } from '../Color';
import { PawnMovement } from '../movements/PawnMovement';
import { Piece } from './Piece';

/** Se mueve con PawnMovement. Al llegar a la última fila corona (ver Game). */
export class Pawn extends Piece {
  constructor(color: Color) {
    super(color, new PawnMovement());
  }

  public getSymbol(): string {
    return 'P';
  }

  public canPromote(): boolean {
    return true;
  }
}
