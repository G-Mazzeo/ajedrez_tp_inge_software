import { describe, expect, it } from 'vitest';
import { GameService } from '../../../src/core/application/GameService';
import { Board } from '../../../src/core/domain/Board';
import { Color } from '../../../src/core/domain/Color';
import { Game } from '../../../src/core/domain/Game';
import { GameStatus } from '../../../src/core/domain/GameStatus';
import { CombinedMovement } from '../../../src/core/domain/movements/CombinedMovement';
import { JumpMovement } from '../../../src/core/domain/movements/JumpMovement';
import { SlideMovement } from '../../../src/core/domain/movements/SlideMovement';
import { Bishop } from '../../../src/core/domain/pieces/Bishop';
import { King } from '../../../src/core/domain/pieces/King';
import { Knight } from '../../../src/core/domain/pieces/Knight';
import { Pawn } from '../../../src/core/domain/pieces/Pawn';
import { Piece } from '../../../src/core/domain/pieces/Piece';
import { Rook } from '../../../src/core/domain/pieces/Rook';
import type { IBoardSetup } from '../../../src/core/domain/setups/IBoardSetup';
import { Square } from '../../../src/core/domain/Square';
import type { GameRepositoryPort } from '../../../src/core/ports/GameRepositoryPort';

// Estas clases viven solo en el test: prueban que el núcleo se extiende SIN modificar ninguna clase existente.

/** Pieza nueva: se mueve como caballo y como alfil. Combina estrategias que ya existen, sin código de movimiento propio. */
class Archbishop extends Piece {
  constructor(color: Color) {
    super(color, new CombinedMovement([new JumpMovement(Knight.OFFSETS), new SlideMovement(Bishop.DIRECTIONS)]));
  }

  public getSymbol(): string {
    return 'A';
  }
}

/** Variante nueva: tablero de 10x10 con reyes, torres, un arzobispo y peones. */
class TenByTenSetup implements IBoardSetup {
  public create(): Board {
    const board = new Board(10, 10);
    for (const [color, backRank, pawnRank] of [[Color.WHITE, 0, 1], [Color.BLACK, 9, 8]] as const) {
      board.place(new Square(0, backRank), new Rook(color));
      board.place(new Square(4, backRank), new King(color));
      board.place(new Square(5, backRank), new Archbishop(color));
      board.place(new Square(9, backRank), new Rook(color));
      for (let file = 0; file < 10; file++) board.place(new Square(file, pawnRank), new Pawn(color));
    }
    return board;
  }
}

class NullRepository implements GameRepositoryPort {
  public save(): void {}

  public load(): Game | null {
    return null;
  }
}

const at = (name: string): Square => Square.fromName(name);
const names = (squares: Square[]): string[] => squares.map((square) => square.name()).sort();

describe('extensión: pieza nueva', () => {
  it('se mueve combinando movimientos de otras piezas', () => {
    const board = new Board();
    board.place(at('d4'), new Archbishop(Color.WHITE));
    expect(board.pieceAt(at('d4'))?.getMoves(at('d4'), board)).toHaveLength(8 + 13);
  });

  it('Game la usa sin conocerla: puede dar jaque', () => {
    const board = new Board();
    board.place(at('e1'), new King(Color.WHITE));
    board.place(at('e8'), new King(Color.BLACK));
    board.place(at('d6'), new Archbishop(Color.WHITE)); // salto de caballo a e8
    expect(new Game(board, Color.BLACK).getStatus()).toBe(GameStatus.CHECK);
  });
});

describe('extensión: tablero de otro tamaño', () => {
  const game = (): Game => new Game(new TenByTenSetup().create());

  it('las piezas se mueven hasta el borde del tablero nuevo', () => {
    const board = new Board(10, 10);
    board.place(at('a1'), new Rook(Color.WHITE));
    expect(names(board.pieceAt(at('a1'))!.getMoves(at('a1'), board))).toContain('j1');
    expect(names(board.pieceAt(at('a1'))!.getMoves(at('a1'), board))).toContain('a10');
  });

  it('los peones salen de la segunda fila de cada lado', () => {
    expect(names(game().legalMovesFrom(at('c2')))).toEqual(['c3', 'c4']);
    expect(names(new Game(new TenByTenSetup().create(), Color.BLACK).legalMovesFrom(at('c9')))).toEqual(['c7', 'c8']);
  });

  it('GameService juega la variante que recibe, también al pedir partida nueva', () => {
    const service = new GameService(new NullRepository(), new TenByTenSetup());
    expect(service.getBoard().getFiles()).toBe(10);
    expect(service.move(at('c2'), at('c4'))).toBe(true);
    expect(service.move(at('c9'), at('c7'))).toBe(true);
    service.newGame();
    expect(service.getBoard().getRanks()).toBe(10);
    expect(service.getBoard().isEmpty(at('c4'))).toBe(true);
  });
});
