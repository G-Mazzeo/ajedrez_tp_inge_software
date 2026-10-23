import { useState } from 'react';
import { Chessboard, type PieceDropHandlerArgs } from 'react-chessboard';
import { Color } from '../../core/domain/Color';
import { GameStatus } from '../../core/domain/GameStatus';
import { Square } from '../../core/domain/Square';
import type { GameServicePort } from '../../core/ports/GameServicePort';
import type { BoardMapper } from './BoardMapper';

interface IChessBoardViewProps {
  service: GameServicePort;
  mapper: BoardMapper;
}

/**
 * Adaptador de ENTRADA: traduce lo que hace el usuario (arrastrar una pieza)
 * a una llamada al puerto de entrada, y muestra lo que el núcleo responde.
 * No tiene reglas: si el movimiento vale o no, lo decide el núcleo.
 */
export function ChessBoardView({ service, mapper }: IChessBoardViewProps) {
  const [position, setPosition] = useState(() => mapper.toPosition(service.getBoard()));
  const [turn, setTurn] = useState(() => service.getTurn());
  const [status, setStatus] = useState(() => service.getStatus());

  const refresh = (): void => {
    setPosition(mapper.toPosition(service.getBoard()));
    setTurn(service.getTurn());
    setStatus(service.getStatus());
  };

  const handlePieceDrop = ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
    if (!targetSquare) return false;
    const moved = service.move(Square.fromName(sourceSquare), Square.fromName(targetSquare));
    if (moved) refresh();
    return moved;
  };

  const handleNewGame = (): void => {
    service.newGame();
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
      <Chessboard options={{ position, onPieceDrop: handlePieceDrop }} />
      <button style={{ marginTop: '1rem' }} onClick={handleNewGame}>
        Nueva partida
      </button>
    </main>
  );
}
