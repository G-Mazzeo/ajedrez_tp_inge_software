import { useState } from 'react';
import {
  Chessboard,
  type PieceDropHandlerArgs,
  type PieceHandlerArgs,
  type SquareHandlerArgs,
} from 'react-chessboard';
import { Color } from '../../core/domain/Color';
import { GameStatus } from '../../core/domain/GameStatus';
import { Square } from '../../core/domain/Square';
import type { GameServicePort } from '../../core/ports/GameServicePort';
import type { BoardMapper } from './BoardMapper';
import type { SquareHighlighter } from './SquareHighlighter';

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

  const targets = selected ? service.getLegalMoves(selected) : [];
  const isCheck = status === GameStatus.CHECK || status === GameStatus.CHECKMATE;
  const kingInCheck = isCheck ? service.getBoard().findKing(turn) : undefined;
  const squareStyles = highlighter.highlight(service.getBoard(), selected, targets, kingInCheck);

  const refresh = (): void => {
    setPosition(mapper.toPosition(service.getBoard()));
    setTurn(service.getTurn());
    setStatus(service.getStatus());
  };

  /** Elige una pieza solo si tiene a dónde ir (así no se marcan piezas del rival). */
  const select = (square: Square): void => {
    setSelected(service.getLegalMoves(square).length > 0 ? square : null);
  };

  const tryMove = (from: Square, to: Square): boolean => {
    setSelected(null);
    const moved = service.move(from, to);
    if (moved) refresh();
    return moved;
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
    <main style={{ maxWidth: 560, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <p>{messages[status]}</p>
      <Chessboard
        options={{
          position,
          squareStyles,
          onPieceDrag: handlePieceDrag,
          onPieceDrop: handlePieceDrop,
          onPieceDragCancel: () => setSelected(null),
          onSquareClick: handleSquareClick,
        }}
      />
      <button style={{ marginTop: '1rem' }} onClick={handleNewGame}>
        Nueva partida
      </button>
    </main>
  );
}
