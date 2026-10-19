import { describe, expect, it } from 'vitest';
import { Board } from '../../../src/core/domain/Board';
import { Color } from '../../../src/core/domain/Color';
import { Bishop } from '../../../src/core/domain/pieces/Bishop';
import { King } from '../../../src/core/domain/pieces/King';
import { Knight } from '../../../src/core/domain/pieces/Knight';
import { Pawn } from '../../../src/core/domain/pieces/Pawn';
import type { Piece } from '../../../src/core/domain/pieces/Piece';
import { Queen } from '../../../src/core/domain/pieces/Queen';
import { Rook } from '../../../src/core/domain/pieces/Rook';
import { Square } from '../../../src/core/domain/Square';

/** Nombres de las casillas a las que puede ir la pieza que está en `from`, ordenados. */
function movesOf(board: Board, from: string): string[] {
  const square = Square.fromName(from);
  const piece = board.pieceAt(square) as Piece;
  return piece
    .getMoves(square, board)
    .map((target) => target.name())
    .sort();
}

function boardWith(pieces: Record<string, Piece>): Board {
  const board = new Board();
  for (const [name, piece] of Object.entries(pieces)) board.place(Square.fromName(name), piece);
  return board;
}

describe('movimientos en la posición inicial', () => {
  const board = Board.initial();

  it('el caballo salta por encima de los peones', () => {
    expect(movesOf(board, 'b1')).toEqual(['a3', 'c3']);
  });

  it('el peón avanza uno o dos', () => {
    expect(movesOf(board, 'e2')).toEqual(['e3', 'e4']);
    expect(movesOf(board, 'e7')).toEqual(['e5', 'e6']);
  });

  it('torre, alfil, dama y rey están bloqueados', () => {
    for (const name of ['a1', 'c1', 'd1', 'e1']) expect(movesOf(board, name)).toEqual([]);
  });
});

describe('movimientos en un tablero vacío desde d4', () => {
  it('torre: 14 casillas', () => expect(movesOf(boardWith({ d4: new Rook(Color.WHITE) }), 'd4')).toHaveLength(14));
  it('alfil: 13 casillas', () => expect(movesOf(boardWith({ d4: new Bishop(Color.WHITE) }), 'd4')).toHaveLength(13));
  it('dama: 27 casillas', () => expect(movesOf(boardWith({ d4: new Queen(Color.WHITE) }), 'd4')).toHaveLength(27));
  it('rey: 8 casillas', () => expect(movesOf(boardWith({ d4: new King(Color.WHITE) }), 'd4')).toHaveLength(8));
  it('caballo: 8 casillas', () => expect(movesOf(boardWith({ d4: new Knight(Color.WHITE) }), 'd4')).toHaveLength(8));
});

describe('capturas', () => {
  it('la torre se detiene en la pieza rival (la puede comer) y antes de la propia', () => {
    const board = boardWith({ a1: new Rook(Color.WHITE), a3: new Pawn(Color.BLACK), c1: new Pawn(Color.WHITE) });
    expect(movesOf(board, 'a1')).toEqual(['a2', 'a3', 'b1']);
  });

  it('el peón captura en diagonal y no puede avanzar si está tapado', () => {
    const board = boardWith({ e4: new Pawn(Color.WHITE), e5: new Pawn(Color.BLACK), d5: new Knight(Color.BLACK) });
    expect(movesOf(board, 'e4')).toEqual(['d5']);
  });
});
