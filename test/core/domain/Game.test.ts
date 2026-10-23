import { describe, expect, it } from 'vitest';
import { Color } from '../../../src/core/domain/Color';
import { Game } from '../../../src/core/domain/Game';
import { Knight } from '../../../src/core/domain/pieces/Knight';
import { StandardSetup } from '../../../src/core/domain/setups/StandardSetup';
import { Square } from '../../../src/core/domain/Square';

const at = (name: string): Square => Square.fromName(name);
const standardGame = (): Game => new Game(new StandardSetup().create());

describe('Game', () => {
  it('empiezan las blancas', () => {
    expect(standardGame().getTurn()).toBe(Color.WHITE);
  });

  it('un movimiento válido mueve la pieza y pasa el turno', () => {
    const game = standardGame();
    expect(game.move(at('e2'), at('e4'))).toBe(true);
    expect(game.getBoard().pieceAt(at('e4'))?.getSymbol()).toBe('P');
    expect(game.getBoard().isEmpty(at('e2'))).toBe(true);
    expect(game.getTurn()).toBe(Color.BLACK);
  });

  it('rechaza mover una pieza que no es del turno', () => {
    const game = standardGame();
    expect(game.move(at('e7'), at('e5'))).toBe(false);
    expect(game.getTurn()).toBe(Color.WHITE);
  });

  it('rechaza un movimiento que la pieza no puede hacer', () => {
    expect(standardGame().move(at('e2'), at('e5'))).toBe(false);
  });

  it('rechaza mover desde una casilla vacía', () => {
    expect(standardGame().move(at('e4'), at('e5'))).toBe(false);
  });

  it('al capturar, la pieza rival desaparece del tablero', () => {
    const game = standardGame();
    for (const [from, to] of [['e2', 'e4'], ['d7', 'd5']]) game.move(at(from), at(to));
    expect(game.move(at('e4'), at('d5'))).toBe(true);
    expect(game.getBoard().pieceAt(at('d5'))?.getColor()).toBe(Color.WHITE);
    expect(game.getBoard().entries()).toHaveLength(31);
  });

  it('no deja capturar una pieza propia', () => {
    const game = standardGame();
    expect(game.move(at('g1'), at('e2'))).toBe(false);
    expect(game.getBoard().pieceAt(at('g1'))).toBeInstanceOf(Knight);
  });
});
