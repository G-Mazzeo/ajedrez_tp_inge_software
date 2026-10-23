import type { Board } from '../domain/Board';
import type { Color } from '../domain/Color';
import { Game } from '../domain/Game';
import type { GameStatus } from '../domain/GameStatus';
import type { Square } from '../domain/Square';
import type { GameRepositoryPort } from '../ports/GameRepositoryPort';
import type { GameServicePort } from '../ports/GameServicePort';

/**
 * Implementa el puerto de entrada usando el dominio y el puerto de salida.
 * No tiene reglas de ajedrez: coordina (mover, y si salió bien, guardar).
 */
export class GameService implements GameServicePort {
  private readonly repository: GameRepositoryPort;
  private game: Game;

  constructor(repository: GameRepositoryPort) {
    this.repository = repository;
    this.game = repository.load() ?? Game.standard();
  }

  public newGame(): void {
    this.game = Game.standard();
    this.repository.save(this.game);
  }

  public move(from: Square, to: Square): boolean {
    const moved = this.game.move(from, to);
    if (moved) this.repository.save(this.game);
    return moved;
  }

  public getLegalMoves(from: Square): Square[] {
    return this.game.legalMovesFrom(from);
  }

  public getBoard(): Board {
    return this.game.getBoard();
  }

  public getTurn(): Color {
    return this.game.getTurn();
  }

  public getStatus(): GameStatus {
    return this.game.getStatus();
  }
}
