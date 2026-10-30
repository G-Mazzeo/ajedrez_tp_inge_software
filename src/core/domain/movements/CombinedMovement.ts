import type { Board } from '../Board';
import type { Color } from '../Color';
import type { Square } from '../Square';
import type { IMovementStrategy } from './IMovementStrategy';

/** Suma los movimientos de varias estrategias. Sirve para piezas nuevas (ej. arzobispo = caballo + alfil). */
export class CombinedMovement implements IMovementStrategy {
  private readonly movements: readonly IMovementStrategy[];

  constructor(movements: readonly IMovementStrategy[]) {
    this.movements = movements;
  }

  public getMoves(from: Square, board: Board, color: Color): Square[] {
    return this.movements.flatMap((movement) => movement.getMoves(from, board, color));
  }
}
