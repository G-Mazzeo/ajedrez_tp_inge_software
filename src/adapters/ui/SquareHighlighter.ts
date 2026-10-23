import type { CSSProperties } from 'react';
import type { Board } from '../../core/domain/Board';
import type { Square } from '../../core/domain/Square';

/**
 * Decide cómo se pinta cada casilla (formato `squareStyles` de react-chessboard).
 * Qué casillas marcar lo decide el núcleo; acá solo se elige el color.
 */
export class SquareHighlighter {
  private static readonly SELECTED: CSSProperties = { backgroundColor: 'rgba(255, 215, 0, 0.5)' };
  private static readonly TARGET: CSSProperties = {
    background: 'radial-gradient(circle, rgba(0, 0, 0, 0.25) 22%, transparent 24%)',
  };
  private static readonly CAPTURE: CSSProperties = {
    background: 'radial-gradient(circle, transparent 58%, rgba(0, 0, 0, 0.25) 60%)',
  };
  private static readonly KING_IN_CHECK: CSSProperties = {
    background: 'radial-gradient(circle, rgba(220, 0, 0, 0.8) 30%, transparent 75%)',
  };

  public highlight(
    board: Board,
    selected: Square | null,
    targets: Square[],
    kingInCheck: Square | undefined,
  ): Record<string, CSSProperties> {
    const styles: Record<string, CSSProperties> = {};
    if (kingInCheck) styles[kingInCheck.name()] = SquareHighlighter.KING_IN_CHECK;
    if (selected) styles[selected.name()] = SquareHighlighter.SELECTED;
    for (const target of targets) {
      styles[target.name()] = board.isEmpty(target) ? SquareHighlighter.TARGET : SquareHighlighter.CAPTURE;
    }
    return styles;
  }
}
