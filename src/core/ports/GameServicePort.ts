import type { Board } from '../domain/Board';
import type { Color } from '../domain/Color';
import type { GameStatus } from '../domain/GameStatus';
import type { Square } from '../domain/Square';

/**
 * Puerto de ENTRADA: lo que el núcleo ofrece al mundo exterior.
 * La UI (o un test, o una CLI) depende de esta interfaz, no de GameService.
 */
export interface GameServicePort {
  newGame(): void;
  move(from: Square, to: Square): boolean;
  getBoard(): Board;
  getTurn(): Color;
  getStatus(): GameStatus;
}
