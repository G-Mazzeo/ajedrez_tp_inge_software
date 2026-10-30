import type { Board } from '../domain/Board';
import type { Color } from '../domain/Color';
import { Game } from '../domain/Game';
import type { GameStatus } from '../domain/GameStatus';
import type { PieceClass } from '../domain/pieces/Piece';
import type { IBoardSetup } from '../domain/setups/IBoardSetup';
import type { Square } from '../domain/Square';
import type { GameRepositoryPort } from '../ports/GameRepositoryPort';
import type { GameServicePort } from '../ports/GameServicePort';

/**
 * Implementa el puerto de entrada usando el dominio y el puerto de salida.
 * No tiene reglas de ajedrez: coordina (mover, y si salió bien, guardar).
 */
export class GameService implements GameServicePort {
  private readonly repository: GameRepositoryPort;
  private readonly setup: IBoardSetup;
  private game: Game;

  /** `setup` decide con qué tablero empieza cada partida nueva (clásico, otro tamaño, otras piezas). */
  constructor(repository: GameRepositoryPort, setup: IBoardSetup) {
    this.repository = repository;
    this.setup = setup;
    this.game = repository.load() ?? this.createGame();
  }

  public newGame(): void {
    this.game = this.createGame();
    this.repository.save(this.game);
  }

  public move(from: Square, to: Square, promoteTo?: PieceClass): boolean {
    const moved = this.game.move(from, to, promoteTo);
    if (moved) this.repository.save(this.game);
    return moved;
  }

  public isPromotion(from: Square, to: Square): boolean {
    return this.game.isPromotion(from, to);
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

  private createGame(): Game {
    return new Game(this.setup.create());
  }
}
