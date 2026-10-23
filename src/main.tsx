import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LocalStorageGameRepository } from './adapters/storage/LocalStorageGameRepository';
import { BoardMapper } from './adapters/ui/BoardMapper';
import { ChessBoardView } from './adapters/ui/ChessBoardView';
import { SquareHighlighter } from './adapters/ui/SquareHighlighter';
import { GameService } from './core/application/GameService';
import { StandardSetup } from './core/domain/setups/StandardSetup';

// Composition root: el único lugar que conoce las clases concretas y las conecta.
// La partida se guarda en el navegador. Para guardarla en otro lado: otra clase GameRepositoryPort y cambiar solo esta línea.
const repository = new LocalStorageGameRepository(window.localStorage);
// Para jugar otra variante (otro tamaño, otras piezas): crear otra clase IBoardSetup y cambiar solo esta línea.
const setup = new StandardSetup();
const service = new GameService(repository, setup);
const mapper = new BoardMapper();
const highlighter = new SquareHighlighter();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChessBoardView service={service} mapper={mapper} highlighter={highlighter} />
  </StrictMode>,
);
