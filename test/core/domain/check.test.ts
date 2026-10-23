import { describe, expect, it } from 'vitest';
import { Board } from '../../../src/core/domain/Board';
import { Color } from '../../../src/core/domain/Color';
import { Game } from '../../../src/core/domain/Game';
import { GameStatus } from '../../../src/core/domain/GameStatus';
import { Bishop } from '../../../src/core/domain/pieces/Bishop';
import { King } from '../../../src/core/domain/pieces/King';
import type { Piece } from '../../../src/core/domain/pieces/Piece';
import { Queen } from '../../../src/core/domain/pieces/Queen';
import { Rook } from '../../../src/core/domain/pieces/Rook';
import { Square } from '../../../src/core/domain/Square';

const at = (name: string): Square => Square.fromName(name);

function boardWith(pieces: Record<string, Piece>): Board {
  const board = new Board();
  for (const [name, piece] of Object.entries(pieces)) board.place(at(name), piece);
  return board;
}

function play(game: Game, ...moves: string[]): void {
  for (const move of moves) {
    const [from, to] = move.split('-');
    expect(game.move(at(from), at(to)), `movimiento ${move}`).toBe(true);
  }
}

describe('Board: ataques', () => {
  it('encuentra al rey de cada color', () => {
    const board = Board.initial();
    expect(board.findKing(Color.WHITE)?.name()).toBe('e1');
    expect(board.findKing(Color.BLACK)?.name()).toBe('e8');
  });

  it('sabe si una casilla está atacada por un color', () => {
    const board = boardWith({ e1: new King(Color.WHITE), e8: new Rook(Color.BLACK) });
    expect(board.isAttackedBy(at('e1'), Color.BLACK)).toBe(true);
    expect(board.isAttackedBy(at('d1'), Color.BLACK)).toBe(false);
  });

  it('clone() devuelve una copia independiente', () => {
    const board = Board.initial();
    const copy = board.clone();
    copy.move(at('e2'), at('e4'));
    expect(board.isEmpty(at('e4'))).toBe(true);
    expect(copy.isEmpty(at('e4'))).toBe(false);
  });
});

describe('Game: jaque', () => {
  it('al empezar no hay jaque', () => {
    const game = Game.standard();
    expect(game.isInCheck()).toBe(false);
    expect(game.getStatus()).toBe(GameStatus.PLAYING);
  });

  it('detecta el jaque', () => {
    const game = new Game(boardWith({ e1: new King(Color.WHITE), e8: new Rook(Color.BLACK) }));
    expect(game.isInCheck()).toBe(true);
    expect(game.getStatus()).toBe(GameStatus.CHECK);
  });

  it('en jaque solo valen los movimientos que lo resuelven', () => {
    const game = new Game(
      boardWith({ e1: new King(Color.WHITE), a2: new Rook(Color.WHITE), e8: new Rook(Color.BLACK) }),
    );
    expect(game.move(at('a2'), at('a3'))).toBe(false); // no tapa el jaque
    expect(game.move(at('a2'), at('e2'))).toBe(true); // lo tapa
  });

  it('una pieza clavada no puede moverse si deja al rey en jaque', () => {
    const game = new Game(
      boardWith({ e1: new King(Color.WHITE), e2: new Bishop(Color.WHITE), e8: new Rook(Color.BLACK) }),
    );
    expect(game.legalMovesFrom(at('e2'))).toEqual([]);
    expect(game.move(at('e2'), at('d3'))).toBe(false);
  });

  it('el rey no puede meterse en una casilla atacada', () => {
    const game = new Game(boardWith({ e1: new King(Color.WHITE), d8: new Rook(Color.BLACK) }));
    expect(game.move(at('e1'), at('d1'))).toBe(false);
    expect(game.move(at('e1'), at('f1'))).toBe(true);
  });
});

describe('Game: fin de partida', () => {
  it('detecta el jaque mate (mate del loco)', () => {
    const game = Game.standard();
    play(game, 'f2-f3', 'e7-e5', 'g2-g4', 'd8-h4');
    expect(game.getStatus()).toBe(GameStatus.CHECKMATE);
  });

  it('detecta el jaque mate (mate del pastor)', () => {
    const game = Game.standard();
    play(game, 'e2-e4', 'e7-e5', 'f1-c4', 'b8-c6', 'd1-h5', 'g8-f6', 'h5-f7');
    expect(game.getStatus()).toBe(GameStatus.CHECKMATE);
  });

  it('después del mate no se puede mover', () => {
    const game = Game.standard();
    play(game, 'f2-f3', 'e7-e5', 'g2-g4', 'd8-h4');
    expect(game.move(at('a2'), at('a3'))).toBe(false);
  });

  it('detecta el ahogado: sin jaque y sin movimientos', () => {
    const board = boardWith({ a8: new King(Color.BLACK), b6: new Queen(Color.WHITE), e1: new King(Color.WHITE) });
    const game = new Game(board, Color.BLACK);
    expect(game.isInCheck()).toBe(false);
    expect(game.getStatus()).toBe(GameStatus.STALEMATE);
  });
});
