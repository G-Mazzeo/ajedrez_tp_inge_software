import type { Board } from './Board';
import { Color } from './Color';
import { GameStatus } from './GameStatus';
import type { PieceClass } from './pieces/Piece';
import { Queen } from './pieces/Queen';
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

  /**
   * Intenta mover. Devuelve false si la partida terminó o el movimiento no es legal.
   * Si un peón llega a la última fila, se cambia por una pieza nueva de `promoteTo` (dama si no se elige).
   */
  public move(from: Square, to: Square, promoteTo: PieceClass = Queen): boolean {
    if (this.isOver()) return false;

    const isLegal = this.legalMovesFrom(from).some((square) => square.equals(to));
    if (!isLegal) return false;

    // No se puede coronar a rey ni volver a ser peón.
    const promoted = this.isPromotion(from, to) ? new promoteTo(this.turn) : undefined;
    if (promoted && (promoted.isKing() || promoted.canPromote())) return false;

    this.board.move(from, to);
    if (promoted) this.board.place(to, promoted);
    this.turn = Game.opposite(this.turn);
    return true;
  }

  /** ¿Este movimiento legal lleva un peón a la última fila? La UI lo pregunta para ofrecer qué pieza elegir. */
  public isPromotion(from: Square, to: Square): boolean {
    const piece = this.board.pieceAt(from);
    if (!piece?.canPromote()) return false;
    const lastRank = piece.getColor() === Color.WHITE ? this.board.getRanks() - 1 : 0;
    return to.rank === lastRank && this.legalMovesFrom(from).some((square) => square.equals(to));
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
