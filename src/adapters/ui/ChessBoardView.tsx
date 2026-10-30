import { useState } from 'react';
import {
  Chessboard,
  type PieceDropHandlerArgs,
  type PieceHandlerArgs,
  type SquareHandlerArgs,
} from 'react-chessboard';
import { Color } from '../../core/domain/Color';
import { GameStatus } from '../../core/domain/GameStatus';
import { Bishop } from '../../core/domain/pieces/Bishop';
import { Knight } from '../../core/domain/pieces/Knight';
import type { PieceClass } from '../../core/domain/pieces/Piece';
import { Queen } from '../../core/domain/pieces/Queen';
import { Rook } from '../../core/domain/pieces/Rook';
import { Square } from '../../core/domain/Square';
import type { GameServicePort } from '../../core/ports/GameServicePort';
import type { BoardMapper } from './BoardMapper';
import type { SquareHighlighter } from './SquareHighlighter';

/** Piezas que se ofrecen al coronar. Con una pieza nueva (ej. arzobispo), agregarla acá. */
const PROMOTION_OPTIONS: { pieceClass: PieceClass; label: string }[] = [
  { pieceClass: Queen, label: 'Dama' },
  { pieceClass: Rook, label: 'Torre' },
  { pieceClass: Bishop, label: 'Alfil' },
  { pieceClass: Knight, label: 'Caballo' },
];

interface IChessBoardViewProps {
  service: GameServicePort;
  mapper: BoardMapper;
  highlighter: SquareHighlighter;
}

/**
 * Adaptador de ENTRADA: traduce lo que hace el usuario (arrastrar o hacer clic)
 * a llamadas al puerto de entrada, y muestra lo que el núcleo responde.
 * No tiene reglas: si un movimiento vale o no, lo decide el núcleo.
 */
export function ChessBoardView({ service, mapper, highlighter }: IChessBoardViewProps) {
  const [position, setPosition] = useState(() => mapper.toPosition(service.getBoard()));
  const [turn, setTurn] = useState(() => service.getTurn());
  const [status, setStatus] = useState(() => service.getStatus());
  const [selected, setSelected] = useState<Square | null>(null);
  // Un peón llegó a la última fila: el movimiento espera a que el usuario elija la pieza.
  const [promotion, setPromotion] = useState<{ from: Square; to: Square } | null>(null);

  const board = service.getBoard();
  const targets = selected ? service.getLegalMoves(selected) : [];
  const isCheck = status === GameStatus.CHECK || status === GameStatus.CHECKMATE;
  const kingInCheck = isCheck ? board.findKing(turn) : undefined;
  const squareStyles = highlighter.highlight(board, selected, targets, kingInCheck);

  const refresh = (): void => {
    setPosition(mapper.toPosition(service.getBoard()));
    setTurn(service.getTurn());
    setStatus(service.getStatus());
  };

  /** Elige una pieza solo si tiene a dónde ir (así no se marcan piezas del rival). */
  const select = (square: Square): void => {
    setPromotion(null);
    setSelected(service.getLegalMoves(square).length > 0 ? square : null);
  };

  const tryMove = (from: Square, to: Square): boolean => {
    setSelected(null);
    if (service.isPromotion(from, to)) {
      setPromotion({ from, to });
      return false; // la pieza vuelve a su lugar hasta que se elija en qué corona
    }
    const moved = service.move(from, to);
    if (moved) refresh();
    return moved;
  };

  const promote = (pieceClass: PieceClass): void => {
    if (!promotion) return;
    if (service.move(promotion.from, promotion.to, pieceClass)) refresh();
    setPromotion(null);
  };

  const handlePieceDrag = ({ square }: PieceHandlerArgs): void => {
    if (square) select(Square.fromName(square));
  };

  const handlePieceDrop = ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
    if (!targetSquare) {
      setSelected(null);
      return false;
    }
    return tryMove(Square.fromName(sourceSquare), Square.fromName(targetSquare));
  };

  /** Mover con dos clics: primero la pieza, después el destino. */
  const handleSquareClick = ({ square }: SquareHandlerArgs): void => {
    const clicked = Square.fromName(square);
    if (selected && targets.some((target) => target.equals(clicked))) {
      tryMove(selected, clicked);
    } else if (selected?.equals(clicked)) {
      setSelected(null);
    } else {
      select(clicked);
    }
  };

  const handleNewGame = (): void => {
    service.newGame();
    setSelected(null);
    setPromotion(null);
    refresh();
  };

  const player = turn === Color.WHITE ? 'blancas' : 'negras';
  const rival = turn === Color.WHITE ? 'negras' : 'blancas';
  const messages: Record<GameStatus, string> = {
    [GameStatus.PLAYING]: `Turno: ${player}`,
    [GameStatus.CHECK]: `¡Jaque! Turno: ${player}`,
    [GameStatus.CHECKMATE]: `Jaque mate: ganan las ${rival}`,
    [GameStatus.STALEMATE]: 'Ahogado: tablas',
  };

  return (
    <main
      style={{
        display: 'flex',
        flexWrap: 'wrap', // en pantallas angostas el panel baja debajo del tablero
        alignItems: 'flex-start',
        gap: '1.5rem',
        maxWidth: 820,
        margin: '2rem auto',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ flex: '0 1 560px' }}>
        <Chessboard
          options={{
            position,
            pieces: mapper.toPieces(board),
            chessboardColumns: board.getFiles(),
            chessboardRows: board.getRanks(),
            squareStyles,
            onPieceDrag: handlePieceDrag,
            onPieceDrop: handlePieceDrop,
            onPieceDragCancel: () => setSelected(null),
            onSquareClick: handleSquareClick,
          }}
        />
      </div>
      {/* Panel a la derecha del tablero: estado de la partida y botón. */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 180 }}>
        <p style={{ margin: 0 }}>{messages[status]}</p>
        {promotion && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ margin: 0 }}>Coronar en {promotion.to.name()}:</p>
            {PROMOTION_OPTIONS.map(({ pieceClass, label }) => (
              <button key={label} onClick={() => promote(pieceClass)}>
                {label}
              </button>
            ))}
            <button onClick={() => setPromotion(null)}>Cancelar</button>
          </div>
        )}
        <button onClick={handleNewGame}>Nueva partida</button>
      </aside>
    </main>
  );
}
