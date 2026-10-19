import { describe, expect, it } from 'vitest';
import { GameService } from '../../../src/core/application/GameService';
import { Board } from '../../../src/core/domain/Board';
import { Color } from '../../../src/core/domain/Color';
import { Game } from '../../../src/core/domain/Game';
import { Square } from '../../../src/core/domain/Square';
import type { GameRepositoryPort } from '../../../src/core/ports/GameRepositoryPort';

/** Repositorio falso: el servicio solo conoce la interfaz, así que en el test le pasamos este. */
class FakeGameRepository implements GameRepositoryPort {
  public saved: Game | null = null;
  public saveCount = 0;

  constructor(initial: Game | null = null) {
    this.saved = initial;
  }

  public save(game: Game): void {
    this.saved = game;
    this.saveCount++;
  }

  public load(): Game | null {
    return this.saved;
  }
}

const at = (name: string): Square => Square.fromName(name);

describe('GameService', () => {
  it('sin partida guardada arranca una nueva', () => {
    const service = new GameService(new FakeGameRepository());
    expect(service.getBoard().entries()).toHaveLength(32);
    expect(service.getTurn()).toBe(Color.WHITE);
  });

  it('carga la partida guardada', () => {
    const saved = new Game(Board.initial(), Color.BLACK);
    expect(new GameService(new FakeGameRepository(saved)).getTurn()).toBe(Color.BLACK);
  });

  it('guarda solo si el movimiento fue válido', () => {
    const repository = new FakeGameRepository();
    const service = new GameService(repository);
    expect(service.move(at('e2'), at('e5'))).toBe(false);
    expect(repository.saveCount).toBe(0);
    expect(service.move(at('e2'), at('e4'))).toBe(true);
    expect(repository.saveCount).toBe(1);
  });

  it('nueva partida vuelve a la posición inicial', () => {
    const service = new GameService(new FakeGameRepository());
    service.move(at('e2'), at('e4'));
    service.newGame();
    expect(service.getTurn()).toBe(Color.WHITE);
    expect(service.getBoard().isEmpty(at('e4'))).toBe(true);
  });
});
