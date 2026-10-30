import { Board } from '../../core/domain/Board';
import { Color } from '../../core/domain/Color';
import { Game } from '../../core/domain/Game';
import { Bishop } from '../../core/domain/pieces/Bishop';
import { King } from '../../core/domain/pieces/King';
import { Knight } from '../../core/domain/pieces/Knight';
import { Pawn } from '../../core/domain/pieces/Pawn';
import type { Piece, PieceClass } from '../../core/domain/pieces/Piece';
import { Queen } from '../../core/domain/pieces/Queen';
import { Rook } from '../../core/domain/pieces/Rook';
import { Square } from '../../core/domain/Square';
import type { GameRepositoryPort } from '../../core/ports/GameRepositoryPort';

/** Solo lo que este repositorio usa de `localStorage`: así en los tests se le pasa uno falso. */
export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>;

/** Cómo queda la partida guardada en el navegador (JSON). */
interface ISavedGame {
  files: number;
  ranks: number;
  turn: Color;
  pieces: { square: string; color: Color; symbol: string }[];
}

const STANDARD_PIECES: PieceClass[] = [King, Queen, Rook, Bishop, Knight, Pawn];

/**
 * Adaptador de SALIDA: guarda la partida en el `localStorage` del navegador (sobrevive a recargar la página).
 * Para volver a crear cada pieza busca su clase por la letra (`getSymbol()`).
 * Pieza nueva: pasar su clase en `pieceClasses` al crear el repositorio (en main.tsx).
 */
export class LocalStorageGameRepository implements GameRepositoryPort {
  private static readonly KEY = 'ajedrez:partida';

  private readonly storage: KeyValueStorage;
  private readonly pieceClasses = new Map<string, PieceClass>();

  constructor(storage: KeyValueStorage, pieceClasses: PieceClass[] = STANDARD_PIECES) {
    this.storage = storage;
    for (const PieceClass of pieceClasses) this.pieceClasses.set(new PieceClass(Color.WHITE).getSymbol(), PieceClass);
  }

  public save(game: Game): void {
    const board = game.getBoard();
    const saved: ISavedGame = {
      files: board.getFiles(),
      ranks: board.getRanks(),
      turn: game.getTurn(),
      pieces: board.entries().map(([square, piece]) => ({
        square: square.name(),
        color: piece.getColor(),
        symbol: piece.getSymbol(),
      })),
    };
    this.storage.setItem(LocalStorageGameRepository.KEY, JSON.stringify(saved));
  }

  /** Si no hay nada guardado, o lo guardado no se entiende, devuelve null y se arranca una partida nueva. */
  public load(): Game | null {
    const json = this.storage.getItem(LocalStorageGameRepository.KEY);
    if (json === null) return null;
    try {
      const saved = JSON.parse(json) as ISavedGame;
      const board = new Board(saved.files, saved.ranks);
      for (const { square, color, symbol } of saved.pieces) {
        board.place(Square.fromName(square), this.createPiece(symbol, color));
      }
      return new Game(board, LocalStorageGameRepository.toColor(saved.turn));
    } catch {
      return null;
    }
  }

  private createPiece(symbol: string, color: Color): Piece {
    const PieceClass = this.pieceClasses.get(symbol);
    if (!PieceClass) throw new Error(`Pieza desconocida: ${symbol}`);
    return new PieceClass(LocalStorageGameRepository.toColor(color));
  }

  private static toColor(value: string): Color {
    if (value !== Color.WHITE && value !== Color.BLACK) throw new Error(`Color inválido: ${value}`);
    return value;
  }
}
