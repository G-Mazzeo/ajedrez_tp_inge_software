import type { Board } from '../Board';
import type { Color } from '../Color';
import type { Square } from '../Square';

/** [columnas, filas] que se desplaza una pieza en un paso. */
export type Direction = readonly [number, number];

/**
 * Strategy: una forma de moverse. Cada pieza recibe una al crearse y le delega getMoves.
 * Recibe el color de la pieza para saber qué es captura y hacia dónde es "adelante".
 */
export interface IMovementStrategy {
  /** Casillas a las que se puede ir desde `from`. Todavía no contempla jaque (eso lo filtra Game). */
  getMoves(from: Square, board: Board, color: Color): Square[];
}
