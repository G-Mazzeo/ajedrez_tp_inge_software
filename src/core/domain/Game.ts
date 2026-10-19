import { Board } from './Board';
import { Color } from './Color';
import type { Square } from './Square';

/** La partida: el tablero, de quién es el turno y las reglas para mover. */
export class Game {
  private readonly board: Board;
  private turn: Color;

  constructor(board: Board, turn: Color = Color.WHITE) {
    this.board = board;
    this.turn = turn;
  }

  public static standard(): Game {
    return new Game(Board.initial());
  }

  /** Intenta mover. Devuelve false si no hay pieza, no es su turno o la pieza no puede ir ahí. */
  public move(from: Square, to: Square): boolean {
    const piece = this.board.pieceAt(from);
    if (!piece || piece.getColor() !== this.turn) return false;

    const canReach = piece.getMoves(from, this.board).some((square) => square.equals(to));
    if (!canReach) return false;

    this.board.move(from, to);
    this.turn = this.turn === Color.WHITE ? Color.BLACK : Color.WHITE;
    return true;
  }

  public getBoard(): Board {
    return this.board;
  }

  public getTurn(): Color {
    return this.turn;
  }
}
