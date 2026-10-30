import { describe, expect, it } from 'vitest';
import { Board } from '../../../src/core/domain/Board';
import { Color } from '../../../src/core/domain/Color';
import { Game } from '../../../src/core/domain/Game';
import { GameStatus } from '../../../src/core/domain/GameStatus';
import { King } from '../../../src/core/domain/pieces/King';
import { Knight } from '../../../src/core/domain/pieces/Knight';
import { Pawn } from '../../../src/core/domain/pieces/Pawn';
import type { Piece } from '../../../src/core/domain/pieces/Piece';
import { Queen } from '../../../src/core/domain/pieces/Queen';
import { Rook } from '../../../src/core/domain/pieces/Rook';
import { Square } from '../../../src/core/domain/Square';

const at = (name: string): Square => Square.fromName(name);

function boardWith(pieces: Record<string, Piece>, files = 8, ranks = 8): Board {
  const board = new Board(files, ranks);
  for (const [name, piece] of Object.entries(pieces)) board.place(at(name), piece);
  return board;
}

/** Reyes lejos para que no molesten; el peón blanco a un paso de coronar. */
const whitePawnOnA7 = (): Game =>
  new Game(boardWith({ e1: new King(Color.WHITE), h6: new King(Color.BLACK), a7: new Pawn(Color.WHITE) }));

describe('coronación', () => {
  it('sin elegir, el peón corona en dama', () => {
    const game = whitePawnOnA7();
    expect(game.move(at('a7'), at('a8'))).toBe(true);
    expect(game.getBoard().pieceAt(at('a8'))).toBeInstanceOf(Queen);
    expect(game.getBoard().pieceAt(at('a8'))?.getColor()).toBe(Color.WHITE);
    expect(game.getTurn()).toBe(Color.BLACK);
  });

  it('se puede elegir otra pieza', () => {
    const game = whitePawnOnA7();
    expect(game.move(at('a7'), at('a8'), Knight)).toBe(true);
    expect(game.getBoard().pieceAt(at('a8'))).toBeInstanceOf(Knight);
  });

  it('no se puede coronar a rey ni a peón', () => {
    const game = whitePawnOnA7();
    expect(game.move(at('a7'), at('a8'), King)).toBe(false);
    expect(game.move(at('a7'), at('a8'), Pawn)).toBe(false);
    expect(game.getBoard().pieceAt(at('a7'))).toBeInstanceOf(Pawn);
    expect(game.getTurn()).toBe(Color.WHITE);
  });

  it('el peón negro corona en la fila 1', () => {
    const game = new Game(
      boardWith({ e8: new King(Color.BLACK), h3: new King(Color.WHITE), b2: new Pawn(Color.BLACK) }),
      Color.BLACK,
    );
    expect(game.move(at('b2'), at('b1'), Rook)).toBe(true);
    expect(game.getBoard().pieceAt(at('b1'))).toBeInstanceOf(Rook);
    expect(game.getBoard().pieceAt(at('b1'))?.getColor()).toBe(Color.BLACK);
  });

  it('también corona capturando', () => {
    const game = new Game(
      boardWith({ e1: new King(Color.WHITE), h6: new King(Color.BLACK), a7: new Pawn(Color.WHITE), b8: new Rook(Color.BLACK) }),
    );
    expect(game.move(at('a7'), at('b8'))).toBe(true);
    expect(game.getBoard().pieceAt(at('b8'))).toBeInstanceOf(Queen);
    expect(game.getBoard().pieceAt(at('b8'))?.getColor()).toBe(Color.WHITE);
  });

  it('la pieza nueva puede dar jaque', () => {
    const game = new Game(
      boardWith({ e1: new King(Color.WHITE), h8: new King(Color.BLACK), a7: new Pawn(Color.WHITE) }),
    );
    game.move(at('a7'), at('a8'));
    expect(game.getStatus()).toBe(GameStatus.CHECK);
  });

  it('en un tablero de 10x10 la última fila es la 10', () => {
    const game = new Game(
      boardWith({ e1: new King(Color.WHITE), j5: new King(Color.BLACK), a8: new Pawn(Color.WHITE) }, 10, 10),
    );
    expect(game.isPromotion(at('a8'), at('a9'))).toBe(false);
    game.move(at('a8'), at('a9'));
    game.move(at('j5'), at('j4'));
    expect(game.isPromotion(at('a9'), at('a10'))).toBe(true);
  });
});

describe('isPromotion', () => {
  it('es true solo si un peón llega legalmente a la última fila', () => {
    const game = new Game(
      boardWith({
        e1: new King(Color.WHITE),
        h6: new King(Color.BLACK),
        a7: new Pawn(Color.WHITE),
        c7: new Pawn(Color.WHITE),
        c8: new Rook(Color.BLACK), // bloquea al peón de c7
        g7: new Rook(Color.WHITE),
      }),
    );
    expect(game.isPromotion(at('a7'), at('a8'))).toBe(true);
    expect(game.isPromotion(at('c7'), at('c8'))).toBe(false);
    expect(game.isPromotion(at('g7'), at('g8'))).toBe(false);
  });
});
