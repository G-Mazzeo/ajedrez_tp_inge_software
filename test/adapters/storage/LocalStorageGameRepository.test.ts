import { describe, expect, it } from 'vitest';
import {
  type KeyValueStorage,
  LocalStorageGameRepository,
} from '../../../src/adapters/storage/LocalStorageGameRepository';
import { Board } from '../../../src/core/domain/Board';
import { Color } from '../../../src/core/domain/Color';
import { Game } from '../../../src/core/domain/Game';
import { JumpMovement } from '../../../src/core/domain/movements/JumpMovement';
import { King } from '../../../src/core/domain/pieces/King';
import { Piece } from '../../../src/core/domain/pieces/Piece';
import { StandardSetup } from '../../../src/core/domain/setups/StandardSetup';
import { Square } from '../../../src/core/domain/Square';

/** localStorage falso: los tests corren sin navegador. */
class FakeStorage implements KeyValueStorage {
  public readonly items = new Map<string, string>();

  public getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.items.set(key, value);
  }
}

/** Pieza que no está entre las clásicas. */
class Wazir extends Piece {
  constructor(color: Color) {
    super(color, new JumpMovement([[1, 0], [-1, 0], [0, 1], [0, -1]]));
  }

  public getSymbol(): string {
    return 'W';
  }
}

const at = (name: string): Square => Square.fromName(name);

describe('LocalStorageGameRepository', () => {
  it('sin nada guardado devuelve null', () => {
    expect(new LocalStorageGameRepository(new FakeStorage()).load()).toBeNull();
  });

  it('recupera tablero y turno después de guardar', () => {
    const storage = new FakeStorage();
    const game = new Game(new StandardSetup().create());
    game.move(at('e2'), at('e4'));
    new LocalStorageGameRepository(storage).save(game);

    // Otro repositorio con el mismo storage = recargar la página.
    const loaded = new LocalStorageGameRepository(storage).load()!;
    expect(loaded.getTurn()).toBe(Color.BLACK);
    expect(loaded.getBoard().entries()).toHaveLength(32);
    expect(loaded.getBoard().isEmpty(at('e2'))).toBe(true);
    expect(loaded.getBoard().pieceAt(at('e4'))?.getSymbol()).toBe('P');
    expect(loaded.getBoard().pieceAt(at('e8'))?.getColor()).toBe(Color.BLACK);
  });

  it('la partida recuperada se puede seguir jugando', () => {
    const storage = new FakeStorage();
    const game = new Game(new StandardSetup().create());
    game.move(at('e2'), at('e4'));
    new LocalStorageGameRepository(storage).save(game);
    expect(new LocalStorageGameRepository(storage).load()!.move(at('e7'), at('e5'))).toBe(true);
  });

  it('guarda el tamaño del tablero y piezas nuevas si se le pasan sus clases', () => {
    const storage = new FakeStorage();
    const board = new Board(10, 10);
    board.place(at('a1'), new King(Color.WHITE));
    board.place(at('j10'), new Wazir(Color.BLACK));
    const repository = new LocalStorageGameRepository(storage, [King, Wazir]);
    repository.save(new Game(board));

    const loaded = repository.load()!.getBoard();
    expect(loaded.getFiles()).toBe(10);
    expect(loaded.pieceAt(at('j10'))).toBeInstanceOf(Wazir);
  });

  it('si lo guardado está roto o tiene una pieza desconocida, devuelve null', () => {
    const storage = new FakeStorage();
    const repository = new LocalStorageGameRepository(storage);
    storage.items.set('ajedrez:partida', '{no es json');
    expect(repository.load()).toBeNull();

    const board = new Board();
    board.place(at('d4'), new Wazir(Color.WHITE));
    repository.save(new Game(board));
    expect(repository.load()).toBeNull();
  });
});
