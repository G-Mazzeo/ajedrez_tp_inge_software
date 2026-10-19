import { useState } from 'react';
import { Chessboard, type PieceDropHandlerArgs } from 'react-chessboard';
import { Color } from '../../core/domain/Color';
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

  const refresh = (): void => {
    setPosition(mapper.toPosition(service.getBoard()));
    setTurn(service.getTurn());
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

  return (
    <main style={{ maxWidth: 560, margin: '2rem auto', fontFamily: 'system-ui, sans-serif' }}>
      <p>Turno: {turn === Color.WHITE ? 'blancas' : 'negras'}</p>
      <Chessboard options={{ position, onPieceDrop: handlePieceDrop }} />
      <button style={{ marginTop: '1rem' }} onClick={handleNewGame}>
        Nueva partida
      </button>
    </main>
  );
}
