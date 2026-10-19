import type { Game } from '../../core/domain/Game';
import type { GameRepositoryPort } from '../../core/ports/GameRepositoryPort';

/** Adaptador de SALIDA: guarda la partida en memoria (se pierde al recargar la página). */
export class InMemoryGameRepository implements GameRepositoryPort {
  private game: Game | null = null;

  public save(game: Game): void {
    this.game = game;
  }

  public load(): Game | null {
    return this.game;
  }
}
