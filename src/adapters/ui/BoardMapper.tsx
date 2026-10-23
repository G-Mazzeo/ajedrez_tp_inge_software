import { defaultPieces, type PieceRenderObject, type PositionDataType } from 'react-chessboard';
import type { Board } from '../../core/domain/Board';
import { Color } from '../../core/domain/Color';
import type { Piece } from '../../core/domain/pieces/Piece';

/**
 * Traduce el Board del núcleo al formato de react-chessboard: { e2: { pieceType: 'wP' } }.
 * El código de cada pieza sale de su símbolo, así que una pieza nueva no obliga a tocar esta clase.
 */
export class BoardMapper {
  // Se guardan para que React reciba siempre la misma función y no vuelva a montar la pieza en cada render.
  private readonly letterPieces = new Map<string, PieceRenderObject[string]>();

  public toPosition(board: Board): PositionDataType {
    const position: PositionDataType = {};
    for (const [square, piece] of board.entries()) {
      position[square.name()] = { pieceType: this.pieceCode(piece) };
    }
    return position;
  }

  /**
   * Cómo dibujar cada pieza. react-chessboard solo trae las 6 clásicas;
   * una pieza que no conoce (una nueva del núcleo) se dibuja con su letra.
   */
  public toPieces(board: Board): PieceRenderObject {
    const pieces: PieceRenderObject = { ...defaultPieces };
    for (const [, piece] of board.entries()) {
      const code = this.pieceCode(piece);
      pieces[code] ??= this.letterPiece(code);
    }
    return pieces;
  }

  private pieceCode(piece: Piece): string {
    const colorLetter = piece.getColor() === Color.WHITE ? 'w' : 'b';
    return colorLetter + piece.getSymbol();
  }

  private letterPiece(code: string): PieceRenderObject[string] {
    let render = this.letterPieces.get(code);
    if (!render) {
      const isWhite = code.startsWith('w');
      render = () => (
        <svg viewBox="0 0 45 45" width="100%" height="100%">
          <circle cx="22.5" cy="22.5" r="17" fill={isWhite ? '#fff' : '#000'} stroke="#000" strokeWidth="1.5" />
          <text
            x="22.5"
            y="23"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="20"
            fontWeight="bold"
            fontFamily="system-ui, sans-serif"
            fill={isWhite ? '#000' : '#fff'}
          >
            {code.slice(1)}
          </text>
        </svg>
      );
      this.letterPieces.set(code, render);
    }
    return render;
  }
}
