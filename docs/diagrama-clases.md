# Diagrama de clases — Arquitectura hexagonal

## 1. Vista general

Quién conoce a quién. Todas las flechas de dependencia apuntan **hacia el núcleo**.

```mermaid
flowchart TB
  Main(["main.tsx · composition root"])

  subgraph UI["ENTRADA · adapters/ui"]
    View["ChessBoardView"]
    Mapper["BoardMapper"]
    Highlighter["SquareHighlighter"]
  end

  subgraph STORAGE["SALIDA · adapters/storage"]
    Repo["LocalStorageGameRepository"]
  end

  subgraph CORE["NÚCLEO · core"]
    subgraph PORTS["ports"]
      InPort[["«interface» GameServicePort"]]
      OutPort[["«interface» GameRepositoryPort"]]
    end
    subgraph APP["application · casos de uso"]
      Service["GameService"]
    end
    subgraph DOMAIN["domain · reglas del ajedrez"]
      Game["Game"] --> Board["Board"] --> Piece["Piece"]
      Setup[["«interface» IBoardSetup"]] -.->|crea| Board
    end
  end

  Main -.->|crea| View
  Main -.->|crea| Repo
  Main -.->|crea| Service

  View -->|usa| InPort
  View --> Mapper
  View --> Highlighter
  Repo -.->|implementa| OutPort

  Service -.->|implementa| InPort
  Service -->|usa| OutPort
  Service --> Game
  Service -->|usa| Setup
```

El **núcleo** tiene tres partes, todas dentro de `src/core/`:

| Parte | Qué hace | Puede importar de |
| --- | --- | --- |
| `core/domain` | Las reglas del ajedrez: piezas, tablero (de cualquier tamaño), variantes (`setups/`), jaque, mate | nada |
| `core/ports` | Las interfaces que forman el borde del hexágono | `domain` |
| `core/application` | `GameService`: coordina los casos de uso (mover, nueva partida) usando el dominio y los puertos | `ports` y `domain` |

Afuera del núcleo:

| Parte | Qué hace | Puede importar de |
| --- | --- | --- |
| `adapters/*` | Lo técnico: React, la librería del tablero, el almacenamiento | `core` (nunca al revés, ni entre adaptadores) |
| `main.tsx` | Crea todas las clases concretas y las conecta | todo |

Al ejecutar, el orden de las llamadas es UI → `GameService` → repositorio. Pero en el código **el repositorio depende del núcleo**, porque implementa la interfaz `GameRepositoryPort` que el núcleo define. Eso es la inversión de dependencias.

## 2. Clases de la arquitectura

Puertos, servicio y adaptadores. El estereotipo de cada clase (`«...»`) dice en qué parte del hexágono vive. Del dominio solo se muestran `Game`, `Board` y los setups, que es donde se conectan; el detalle está en la sección 3.

```mermaid
classDiagram
  direction TB

  class ChessBoardView {
    <<adaptador de entrada · React>>
    -selected: Square
    -handleSquareClick()
    -handlePieceDrag()
    -handlePieceDrop() boolean
    -handleNewGame()
  }
  class BoardMapper {
    <<adaptador de entrada>>
    -letterPieces: Map~string, PieceRender~
    +toPosition(board: Board) PositionDataType
    +toPieces(board: Board) PieceRenderObject
    -pieceCode(piece: Piece) string
    -letterPiece(code: string) PieceRender
  }
  class SquareHighlighter {
    <<adaptador de entrada>>
    -SELECTED$
    -TARGET$
    -CAPTURE$
    -KING_IN_CHECK$
    +highlight(board, selected, targets, kingInCheck) SquareStyles
  }
  class Chessboard {
    <<librería react-chessboard>>
  }

  class GameServicePort {
    <<interface · núcleo · puerto de entrada>>
    +newGame() void
    +move(from: Square, to: Square) boolean
    +getLegalMoves(from: Square) Square[]
    +getBoard() Board
    +getTurn() Color
    +getStatus() GameStatus
  }
  class GameService {
    <<núcleo · aplicación>>
    -repository: GameRepositoryPort
    -setup: IBoardSetup
    -game: Game
    +newGame() void
    +move(from: Square, to: Square) boolean
    +getLegalMoves(from: Square) Square[]
    +getBoard() Board
    +getTurn() Color
    +getStatus() GameStatus
    -createGame() Game
  }
  class GameRepositoryPort {
    <<interface · núcleo · puerto de salida>>
    +save(game: Game) void
    +load() Game
  }
  class LocalStorageGameRepository {
    <<adaptador de salida · localStorage>>
    -KEY$
    -storage: KeyValueStorage
    -pieceClasses: Map~string, PieceClass~
    +save(game: Game) void
    +load() Game
    -createPiece(symbol: string, color: Color) Piece
    -toColor(value: string)$ Color
  }

  class Game {
    <<núcleo · dominio>>
  }
  class Board {
    <<núcleo · dominio>>
  }
  class IBoardSetup {
    <<interface · núcleo · dominio>>
    +create() Board
  }
  class StandardSetup {
    <<núcleo · dominio>>
    +create() Board
  }

  class main["main.tsx"] {
    <<composition root>>
  }

  ChessBoardView --> GameServicePort : usa
  ChessBoardView --> BoardMapper
  ChessBoardView --> SquareHighlighter
  ChessBoardView ..> Chessboard : renderiza
  BoardMapper ..> Board : traduce

  GameService ..|> GameServicePort : implementa
  GameService --> GameRepositoryPort : usa
  GameService --> Game : coordina
  GameService --> IBoardSetup : usa
  Game *-- Board
  StandardSetup ..|> IBoardSetup : implementa

  LocalStorageGameRepository ..|> GameRepositoryPort : implementa
  LocalStorageGameRepository ..> Board : reconstruye

  main ..> ChessBoardView : crea
  main ..> GameService : crea
  main ..> LocalStorageGameRepository : crea
  main ..> StandardSetup : crea
```

## 3. Clases del dominio

Las reglas del ajedrez. No conocen ni los puertos, ni los adaptadores, ni React.

```mermaid
classDiagram
  direction TB

  class Game {
    -board: Board
    -turn: Color
    +move(from: Square, to: Square) boolean
    +legalMovesFrom(from: Square) Square[]
    +isInCheck() boolean
    +getStatus() GameStatus
    +getBoard() Board
    +getTurn() Color
    -isOver() boolean
    -hasLegalMoves() boolean
    -leavesKingInCheck(from: Square, to: Square) boolean
    -isKingAttacked(board: Board, color: Color)$ boolean
    -opposite(color: Color)$ Color
  }
  class Board {
    -files: number
    -ranks: number
    -pieces: Map~string, Piece~
    +getFiles() number
    +getRanks() number
    +contains(square: Square) boolean
    +pieceAt(square: Square) Piece
    +isEmpty(square: Square) boolean
    +place(square: Square, piece: Piece) void
    +move(from: Square, to: Square) void
    +entries() Square_Piece[]
    +findKing(color: Color) Square
    +isAttackedBy(square: Square, attacker: Color) boolean
    +clone() Board
  }
  class Square {
    +file: number
    +rank: number
    +fromName(name: string)$ Square
    +name() string
    +equals(other: Square) boolean
    +offset(fileDelta: number, rankDelta: number) Square
  }
  class Piece {
    <<abstract>>
    #color: Color
    +getColor() Color
    +getSymbol()* string
    +isKing() boolean
    +getMoves(from: Square, board: Board)* Square[]
    #slide(from, board, directions) Square[]
    #jump(from, board, offsets) Square[]
    #isEnemyAt(square: Square, board: Board) boolean
  }
  class King {
    +OFFSETS$
    +getSymbol() string
    +isKing() boolean
    +getMoves(from, board) Square[]
  }
  class Queen {
    +DIRECTIONS$
    +getSymbol() string
    +getMoves(from, board) Square[]
  }
  class Rook {
    +DIRECTIONS$
    +getSymbol() string
    +getMoves(from, board) Square[]
  }
  class Bishop {
    +DIRECTIONS$
    +getSymbol() string
    +getMoves(from, board) Square[]
  }
  class Knight {
    +OFFSETS$
    +getSymbol() string
    +getMoves(from, board) Square[]
  }
  class Pawn {
    +getSymbol() string
    +getMoves(from, board) Square[]
  }
  class Color {
    <<enumeration>>
    WHITE
    BLACK
  }
  class IBoardSetup {
    <<interface>>
    +create() Board
  }
  class StandardSetup {
    +create() Board
  }
  class GameStatus {
    <<enumeration>>
    PLAYING
    CHECK
    CHECKMATE
    STALEMATE
  }

  Game *-- Board : tiene
  Board o-- "0..*" Piece : contiene
  StandardSetup ..|> IBoardSetup : implementa
  StandardSetup ..> Board : crea y llena
  Piece <|-- King
  Piece <|-- Queen
  Piece <|-- Rook
  Piece <|-- Bishop
  Piece <|-- Knight
  Piece <|-- Pawn
  Game ..> GameStatus
  Game ..> Square
  Piece ..> Color
```

## Cómo leer las flechas

| Flecha | Significa | Ejemplo |
| --- | --- | --- |
| Línea llena con triángulo | Herencia: "es un" | `King` es una `Piece` |
| Punteada con triángulo | Implementa una interfaz | `GameService` implementa `GameServicePort` |
| Rombo lleno | Composición: la parte no existe sin el todo | `Game` tiene un `Board` |
| Rombo vacío | Agregación: contiene, pero las partes existen solas | `Board` contiene `Piece` |
| Línea llena con flecha | Asociación: guarda una referencia y la usa | `GameService` usa `GameRepositoryPort` |
| Punteada con flecha | Dependencia: la usa o la crea, sin guardarla | `main.tsx` crea `GameService` |

## Notas

- `Square` y `Color` se usan en casi todas las clases. Para no llenar el diagrama de flechas, solo se dibujan las dependencias más importantes.
- `ChessBoardView` es una función, porque React exige funciones para usar hooks. Se dibuja como clase para mostrar su rol de adaptador. `main.tsx` es el script de arranque.
- `Board.entries()` devuelve `[Square, Piece][]`. En el diagrama figura como `Square_Piece[]` porque Mermaid no acepta tuplas.
- `pieceAt()` y `findKing()` pueden devolver `undefined`, y `load()` puede devolver `null`.
- `OFFSETS` y `DIRECTIONS` son públicas para que una pieza nueva pueda reutilizarlas (ej. caballo + alfil).
- `KeyValueStorage` es la parte de `localStorage` que usa el repositorio (`getItem`, `setItem`); en los tests se le pasa uno falso. `PieceClass` es cualquier clase de pieza (`new (color) => Piece`): con ellas recrea las piezas por su letra.
- `PieceRender` es el tipo de cada función de `PieceRenderObject` (react-chessboard): dibuja una pieza.
