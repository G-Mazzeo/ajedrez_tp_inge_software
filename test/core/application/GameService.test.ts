import { describe, expect, it } from 'vitest';
import { GameService } from '../../../src/core/application/GameService';
import { Color } from '../../../src/core/domain/Color';
import { Game } from '../../../src/core/domain/Game';
import { GameStatus } from '../../../src/core/domain/GameStatus';
import { StandardSetup } from '../../../src/core/domain/setups/StandardSetup';
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
    const service = new GameService(new FakeGameRepository(), new StandardSetup());
    expect(service.getBoard().entries()).toHaveLength(32);
    expect(service.getTurn()).toBe(Color.WHITE);
  });

  it('carga la partida guardada', () => {
    const saved = new Game(new StandardSetup().create(), Color.BLACK);
    expect(new GameService(new FakeGameRepository(saved), new StandardSetup()).getTurn()).toBe(Color.BLACK);
  });

  it('guarda solo si el movimiento fue válido', () => {
    const repository = new FakeGameRepository();
    const service = new GameService(repository, new StandardSetup());
    expect(service.move(at('e2'), at('e5'))).toBe(false);
    expect(repository.saveCount).toBe(0);
    expect(service.move(at('e2'), at('e4'))).toBe(true);
    expect(repository.saveCount).toBe(1);
  });

  it('nueva partida vuelve a la posición inicial', () => {
    const service = new GameService(new FakeGameRepository(), new StandardSetup());
    service.move(at('e2'), at('e4'));
    service.newGame();
    expect(service.getTurn()).toBe(Color.WHITE);
    expect(service.getBoard().isEmpty(at('e4'))).toBe(true);
  });
});

describe('GameService: estado', () => {
  it('expone el estado de la partida', () => {
    const service = new GameService(new FakeGameRepository(), new StandardSetup());
    expect(service.getStatus()).toBe(GameStatus.PLAYING);
    for (const [from, to] of [['f2', 'f3'], ['e7', 'e5'], ['g2', 'g4'], ['d8', 'h4']]) service.move(at(from), at(to));
    expect(service.getStatus()).toBe(GameStatus.CHECKMATE);
  });
});

describe('GameService: movimientos posibles', () => {
  it('devuelve los destinos legales de una pieza', () => {
    const service = new GameService(new FakeGameRepository(), new StandardSetup());
    const targets = service.getLegalMoves(at('g1')).map((square) => square.name());
    expect(targets.sort()).toEqual(['f3', 'h3']);
  });

  it('no devuelve nada para piezas del rival o casillas vacías', () => {
    const service = new GameService(new FakeGameRepository(), new StandardSetup());
    expect(service.getLegalMoves(at('e7'))).toEqual([]);
    expect(service.getLegalMoves(at('e4'))).toEqual([]);
  });
});
