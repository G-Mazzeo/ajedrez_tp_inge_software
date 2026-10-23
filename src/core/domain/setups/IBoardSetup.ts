import type { Board } from '../Board';

/**
 * Arma el tablero con el que empieza una partida: tamaño y posición inicial.
 * Cada variante (ajedrez clásico, otro tamaño, otras piezas) es una clase nueva que implementa esto.
 */
export interface IBoardSetup {
  create(): Board;
}
