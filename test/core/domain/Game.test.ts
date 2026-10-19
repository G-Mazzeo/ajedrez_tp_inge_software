import { describe, expect, it } from 'vitest';
import { Color } from '../../../src/core/domain/Color';
import { Game } from '../../../src/core/domain/Game';
import { PieceType } from '../../../src/core/domain/PieceType';
import { Square } from '../../../src/core/domain/Square';

const at = (name: string): Square => Square.fromName(name);

describe('Game', () => {
  it('empiezan las blancas', () => {
    expect(Game.standard().getTurn()).toBe(Color.WHITE);
  });

  it('un movimiento válido mueve la pieza y pasa el turno', () => {
    const game = Game.standard();
    expect(game.move(at('e2'), at('e4'))).toBe(true);
    expect(game.getBoard().pieceAt(at('e4'))?.getType()).toBe(PieceType.PAWN);
    expect(game.getBoard().isEmpty(at('e2'))).toBe(true);
    expect(game.getTurn()).toBe(Color.BLACK);
  });

  it('rechaza mover una pieza que no es del turno', () => {
    const game = Game.standard();
    expect(game.move(at('e7'), at('e5'))).toBe(false);
    expect(game.getTurn()).toBe(Color.WHITE);
  });

  it('rechaza un movimiento que la pieza no puede hacer', () => {
    expect(Game.standard().move(at('e2'), at('e5'))).toBe(false);
  });

  it('rechaza mover desde una casilla vacía', () => {
    expect(Game.standard().move(at('e4'), at('e5'))).toBe(false);
  });
});
