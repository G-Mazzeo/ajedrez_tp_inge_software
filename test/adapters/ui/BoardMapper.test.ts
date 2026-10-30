import { defaultPieces } from 'react-chessboard';
import { describe, expect, it } from 'vitest';
import { BoardMapper } from '../../../src/adapters/ui/BoardMapper';
import { Board } from '../../../src/core/domain/Board';
import { Color } from '../../../src/core/domain/Color';
import { JumpMovement } from '../../../src/core/domain/movements/JumpMovement';
import { Piece } from '../../../src/core/domain/pieces/Piece';
import { Queen } from '../../../src/core/domain/pieces/Queen';
import { StandardSetup } from '../../../src/core/domain/setups/StandardSetup';
import { Square } from '../../../src/core/domain/Square';

/** Una pieza que react-chessboard no conoce. */
class Camel extends Piece {
  constructor(color: Color) {
    super(color, new JumpMovement([[1, 3], [3, 1], [3, -1], [1, -3], [-1, -3], [-3, -1], [-3, 1], [-1, 3]]));
  }

  public getSymbol(): string {
    return 'C';
  }
}

describe('BoardMapper', () => {
  const mapper = new BoardMapper();

  it('arma el código de cada pieza con su color y su símbolo', () => {
    const position = mapper.toPosition(new StandardSetup().create());
    expect(position.e1).toEqual({ pieceType: 'wK' });
    expect(position.g8).toEqual({ pieceType: 'bN' });
    expect(Object.keys(position)).toHaveLength(32);
  });

  it('usa los dibujos de la librería para las piezas clásicas', () => {
    const board = new Board();
    board.place(Square.fromName('d1'), new Queen(Color.WHITE));
    expect(mapper.toPieces(board).wQ).toBe(defaultPieces.wQ);
  });

  it('dibuja con su letra una pieza que la librería no conoce, siempre con la misma función', () => {
    const board = new Board();
    board.place(Square.fromName('d4'), new Camel(Color.BLACK));
    const first = mapper.toPieces(board).bC;
    expect(first).toBeTypeOf('function');
    expect(mapper.toPieces(board).bC).toBe(first);
  });
});
