import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { InMemoryGameRepository } from './adapters/storage/InMemoryGameRepository';
import { BoardMapper } from './adapters/ui/BoardMapper';
import { ChessBoardView } from './adapters/ui/ChessBoardView';
import { GameService } from './core/application/GameService';

// Composition root: el único lugar que conoce las clases concretas y las conecta.
// Para guardar en localStorage: crear LocalStorageGameRepository y cambiar solo esta línea.
const repository = new InMemoryGameRepository();
const service = new GameService(repository);
const mapper = new BoardMapper();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChessBoardView service={service} mapper={mapper} />
  </StrictMode>,
);
