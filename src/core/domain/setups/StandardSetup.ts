import { Board } from '../Board';
import { Color } from '../Color';
import { Bishop } from '../pieces/Bishop';
import { King } from '../pieces/King';
import { Knight } from '../pieces/Knight';
import { Pawn } from '../pieces/Pawn';
import { Queen } from '../pieces/Queen';
import { Rook } from '../pieces/Rook';
import { Square } from '../Square';
import type { IBoardSetup } from './IBoardSetup';

/** El ajedrez clásico: 8x8 con las 32 piezas en su lugar. */
export class StandardSetup implements IBoardSetup {
  public create(): Board {
    const board = new Board(8, 8);
    const backRank = [Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook];
    backRank.forEach((PieceClass, file) => {
      board.place(new Square(file, 0), new PieceClass(Color.WHITE));
      board.place(new Square(file, 1), new Pawn(Color.WHITE));
      board.place(new Square(file, 6), new Pawn(Color.BLACK));
      board.place(new Square(file, 7), new PieceClass(Color.BLACK));
    });
    return board;
  }
}
