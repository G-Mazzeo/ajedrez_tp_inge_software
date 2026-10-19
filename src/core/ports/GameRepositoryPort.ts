import type { Game } from '../domain/Game';

/**
 * Puerto de SALIDA: lo que el núcleo necesita del mundo exterior.
 * El núcleo define el contrato; un adaptador decide cómo y dónde se guarda.
 */
export interface GameRepositoryPort {
  save(game: Game): void;
  load(): Game | null;
}
