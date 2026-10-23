import { describe, expect, it } from 'vitest';
import { Board } from '../../../src/core/domain/Board';
import { Color } from '../../../src/core/domain/Color';
import { Rook } from '../../../src/core/domain/pieces/Rook';
import { StandardSetup } from '../../../src/core/domain/setups/StandardSetup';
import { Square } from '../../../src/core/domain/Square';

const at = (name: string): Square => Square.fromName(name);

describe('StandardSetup', () => {
  const board = new StandardSetup().create();

  it('arma un tablero de 8x8 con 32 piezas', () => {
    expect(board.getFiles()).toBe(8);
    expect(board.getRanks()).toBe(8);
    expect(board.entries()).toHaveLength(32);
  });

  it('pone cada pieza en su lugar', () => {
    expect(board.pieceAt(at('e1'))?.getSymbol()).toBe('K');
    expect(board.pieceAt(at('e1'))?.isKing()).toBe(true);
    expect(board.pieceAt(at('d8'))?.getSymbol()).toBe('Q');
    expect(board.pieceAt(at('d8'))?.getColor()).toBe(Color.BLACK);
    expect(board.pieceAt(at('g1'))?.getSymbol()).toBe('N');
    expect(board.pieceAt(at('a7'))?.getSymbol()).toBe('P');
    expect(board.isEmpty(at('e4'))).toBe(true);
  });
});

describe('Board: tamaño', () => {
  it('por defecto es de 8x8', () => {
    const board = new Board();
    expect(board.contains(at('h8'))).toBe(true);
    expect(board.contains(at('h8').offset(1, 0))).toBe(false);
    expect(board.contains(at('a1').offset(0, -1))).toBe(false);
  });

  it('puede tener otro tamaño', () => {
    const board = new Board(10, 6);
    expect(board.contains(at('j6'))).toBe(true);
    expect(board.contains(at('k6'))).toBe(false);
    expect(board.contains(at('j7'))).toBe(false);
  });

  it('no deja poner una pieza fuera del tablero', () => {
    expect(() => new Board().place(at('i1'), new Rook(Color.WHITE))).toThrow();
  });

  it('clone() conserva el tamaño', () => {
    const copy = new Board(10, 10).clone();
    expect(copy.getFiles()).toBe(10);
    expect(copy.getRanks()).toBe(10);
  });
});
