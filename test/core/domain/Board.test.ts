import { describe, expect, it } from 'vitest';
import { Board } from '../../../src/core/domain/Board';
import { Color } from '../../../src/core/domain/Color';
import { PieceType } from '../../../src/core/domain/PieceType';
import { Square } from '../../../src/core/domain/Square';

describe('Board.initial', () => {
  const board = Board.initial();

  it('tiene 32 piezas', () => {
    expect(board.entries()).toHaveLength(32);
  });

  it('pone cada pieza en su lugar', () => {
    expect(board.pieceAt(Square.fromName('e1'))?.getType()).toBe(PieceType.KING);
    expect(board.pieceAt(Square.fromName('d8'))?.getType()).toBe(PieceType.QUEEN);
    expect(board.pieceAt(Square.fromName('d8'))?.getColor()).toBe(Color.BLACK);
    expect(board.pieceAt(Square.fromName('g1'))?.getType()).toBe(PieceType.KNIGHT);
    expect(board.pieceAt(Square.fromName('a7'))?.getType()).toBe(PieceType.PAWN);
    expect(board.isEmpty(Square.fromName('e4'))).toBe(true);
  });
});
