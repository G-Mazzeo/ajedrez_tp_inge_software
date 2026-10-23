import type { Board } from './Board';
import { Color } from './Color';
import { GameStatus } from './GameStatus';
import type { Square } from './Square';

/**
 * La partida: el tablero, de quién es el turno y las reglas para mover.
 * No sabe con qué tablero empieza: se lo pasan armado (ver IBoardSetup).
 */
export class Game {
  private readonly board: Board;
  private turn: Color;

  constructor(board: Board, turn: Color = Color.WHITE) {
    this.board = board;
    this.turn = turn;
  }

  /** Intenta mover. Devuelve false si la partida terminó o el movimiento no es legal. */
  public move(from: Square, to: Square): boolean {
    if (this.isOver()) return false;

    const isLegal = this.legalMovesFrom(from).some((square) => square.equals(to));
    if (!isLegal) return false;

    this.board.move(from, to);
    this.turn = Game.opposite(this.turn);
    return true;
  }

  /** Movimientos de la pieza que está en `from` que no dejan al propio rey en jaque. */
  public legalMovesFrom(from: Square): Square[] {
    const piece = this.board.pieceAt(from);
    if (!piece || piece.getColor() !== this.turn) return [];
    return piece.getMoves(from, this.board).filter((to) => !this.leavesKingInCheck(from, to));
  }

  /** ¿El rey del jugador que mueve está atacado? */
  public isInCheck(): boolean {
    return Game.isKingAttacked(this.board, this.turn);
  }

  public getStatus(): GameStatus {
    const inCheck = this.isInCheck();
    if (!this.hasLegalMoves()) return inCheck ? GameStatus.CHECKMATE : GameStatus.STALEMATE;
    return inCheck ? GameStatus.CHECK : GameStatus.PLAYING;
  }

  public getBoard(): Board {
    return this.board;
  }

  public getTurn(): Color {
    return this.turn;
  }

  private isOver(): boolean {
    const status = this.getStatus();
    return status === GameStatus.CHECKMATE || status === GameStatus.STALEMATE;
  }

  private hasLegalMoves(): boolean {
    return this.board
      .entries()
      .some(([from, piece]) => piece.getColor() === this.turn && this.legalMovesFrom(from).length > 0);
  }

  /** Simula el movimiento en una copia del tablero y mira si el rey propio queda atacado. */
  private leavesKingInCheck(from: Square, to: Square): boolean {
    const simulated = this.board.clone();
    simulated.move(from, to);
    return Game.isKingAttacked(simulated, this.turn);
  }

  private static isKingAttacked(board: Board, color: Color): boolean {
    const king = board.findKing(color);
    return king !== undefined && board.isAttackedBy(king, Game.opposite(color));
  }

  private static opposite(color: Color): Color {
    return color === Color.WHITE ? Color.BLACK : Color.WHITE;
  }
}
