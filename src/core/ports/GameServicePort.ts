import type { Board } from '../domain/Board';
import type { Color } from '../domain/Color';
import type { GameStatus } from '../domain/GameStatus';
import type { PieceClass } from '../domain/pieces/Piece';
import type { Square } from '../domain/Square';

/**
 * Puerto de ENTRADA: lo que el núcleo ofrece al mundo exterior.
 * La UI (o un test, o una CLI) depende de esta interfaz, no de GameService.
 */
export interface GameServicePort {
  newGame(): void;
  /** `promoteTo`: en qué se convierte un peón que llega a la última fila (dama si no se pasa). */
  move(from: Square, to: Square, promoteTo?: PieceClass): boolean;
  /** ¿Este movimiento corona un peón? Así la UI sabe cuándo preguntar qué pieza elegir. */
  isPromotion(from: Square, to: Square): boolean;
  /** Casillas a las que puede ir la pieza que está en `from` (vacío si no es del turno). */
  getLegalMoves(from: Square): Square[];
  getBoard(): Board;
  getTurn(): Color;
  getStatus(): GameStatus;
}
