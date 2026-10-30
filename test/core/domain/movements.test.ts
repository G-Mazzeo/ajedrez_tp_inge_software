import { describe, expect, it } from 'vitest';
import { Board } from '../../../src/core/domain/Board';
import { Color } from '../../../src/core/domain/Color';
import { CombinedMovement } from '../../../src/core/domain/movements/CombinedMovement';
import type { IMovementStrategy } from '../../../src/core/domain/movements/IMovementStrategy';
import { JumpMovement } from '../../../src/core/domain/movements/JumpMovement';
import { PawnMovement } from '../../../src/core/domain/movements/PawnMovement';
import { SlideMovement } from '../../../src/core/domain/movements/SlideMovement';
import { Knight } from '../../../src/core/domain/pieces/Knight';
import { Pawn } from '../../../src/core/domain/pieces/Pawn';
import { Piece } from '../../../src/core/domain/pieces/Piece';
import { Rook } from '../../../src/core/domain/pieces/Rook';
import { Square } from '../../../src/core/domain/Square';

// Las estrategias se prueban solas, sin ninguna pieza que las use.

const at = (name: string): Square => Square.fromName(name);
const names = (squares: Square[]): string[] => squares.map((square) => square.name()).sort();

describe('SlideMovement', () => {
  const rightAndUp = new SlideMovement([[1, 0], [0, 1]]);

  it('avanza hasta el borde del tablero', () => {
    expect(names(rightAndUp.getMoves(at('f6'), new Board(), Color.WHITE))).toEqual(['f7', 'f8', 'g6', 'h6']);
  });

  it('frena antes de una pieza propia y captura una rival', () => {
    const board = new Board();
    board.place(at('c1'), new Pawn(Color.WHITE));
    board.place(at('a3'), new Pawn(Color.BLACK));
    expect(names(rightAndUp.getMoves(at('a1'), board, Color.WHITE))).toEqual(['a2', 'a3', 'b1']);
  });
});

describe('JumpMovement', () => {
  it('salta por encima de las piezas, no cae en una propia ni fuera del tablero', () => {
    const board = new Board();
    board.place(at('a2'), new Pawn(Color.WHITE));
    board.place(at('b2'), new Pawn(Color.WHITE));
    board.place(at('c2'), new Pawn(Color.WHITE)); // propia en un destino
    board.place(at('b3'), new Pawn(Color.BLACK)); // rival en un destino
    expect(names(new JumpMovement(Knight.OFFSETS).getMoves(at('a1'), board, Color.WHITE))).toEqual(['b3']);
  });
});

describe('PawnMovement', () => {
  const pawn = new PawnMovement();

  it('"adelante" depende del color', () => {
    expect(names(pawn.getMoves(at('e2'), new Board(), Color.WHITE))).toEqual(['e3', 'e4']);
    expect(names(pawn.getMoves(at('e7'), new Board(), Color.BLACK))).toEqual(['e5', 'e6']);
  });

  it('captura en diagonal solo si hay un rival', () => {
    const board = new Board();
    board.place(at('d3'), new Pawn(Color.BLACK));
    board.place(at('f3'), new Pawn(Color.WHITE));
    expect(names(pawn.getMoves(at('e2'), board, Color.WHITE))).toEqual(['d3', 'e3', 'e4']);
  });
});

describe('CombinedMovement', () => {
  it('suma los movimientos de cada estrategia', () => {
    const combined = new CombinedMovement([new JumpMovement([[1, 2]]), new SlideMovement([[0, 1]])]);
    expect(names(combined.getMoves(at('a6'), new Board(), Color.WHITE))).toEqual(['a7', 'a8', 'b8']);
  });
});

describe('Piece delega en su estrategia', () => {
  /** Estrategia falsa: anota con qué la llamaron. */
  class FakeMovement implements IMovementStrategy {
    public receivedColor: Color | null = null;

    public getMoves(_from: Square, _board: Board, color: Color): Square[] {
      this.receivedColor = color;
      return [at('h8')];
    }
  }

  class TestPiece extends Piece {
    public getSymbol(): string {
      return 'T';
    }
  }

  it('devuelve lo que calcula la estrategia, pasándole su color', () => {
    const movement = new FakeMovement();
    const piece = new TestPiece(Color.BLACK, movement);
    expect(names(piece.getMoves(at('a1'), new Board()))).toEqual(['h8']);
    expect(movement.receivedColor).toBe(Color.BLACK);
  });

  it('la misma pieza clásica sigue moviéndose igual (la torre usa SlideMovement)', () => {
    expect(new Rook(Color.WHITE).getMoves(at('a1'), new Board())).toHaveLength(14);
  });
});
