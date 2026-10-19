import type { PositionDataType } from 'react-chessboard';
import type { Board } from '../../core/domain/Board';
import { Color } from '../../core/domain/Color';
import type { Piece } from '../../core/domain/pieces/Piece';
import { PieceType } from '../../core/domain/PieceType';

/** Traduce el Board del núcleo al formato de react-chessboard: { e2: { pieceType: 'wP' } }. */
export class BoardMapper {
  private static readonly LETTERS: Record<PieceType, string> = {
    [PieceType.KING]: 'K',
    [PieceType.QUEEN]: 'Q',
    [PieceType.ROOK]: 'R',
    [PieceType.BISHOP]: 'B',
    [PieceType.KNIGHT]: 'N',
    [PieceType.PAWN]: 'P',
  };

  public toPosition(board: Board): PositionDataType {
    const position: PositionDataType = {};
    for (const [square, piece] of board.entries()) {
      position[square.name()] = { pieceType: this.pieceCode(piece) };
    }
    return position;
  }

  private pieceCode(piece: Piece): string {
    const colorLetter = piece.getColor() === Color.WHITE ? 'w' : 'b';
    return colorLetter + BoardMapper.LETTERS[piece.getType()];
  }
}
