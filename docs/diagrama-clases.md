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
    Repo["InMemoryGameRepository"]
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
```

El **núcleo** tiene tres partes, todas dentro de `src/core/`:

| Parte | Qué hace | Puede importar de |
| --- | --- | --- |
| `core/domain` | Las reglas del ajedrez: piezas, tablero, jaque, mate | nada |
| `core/ports` | Las interfaces que forman el borde del hexágono | `domain` |
| `core/application` | `GameService`: coordina los casos de uso (mover, nueva partida) usando el dominio y los puertos | `ports` y `domain` |

Afuera del núcleo:

| Parte | Qué hace | Puede importar de |
| --- | --- | --- |
| `adapters/*` | Lo técnico: React, la librería del tablero, el almacenamiento | `core` (nunca al revés, ni entre adaptadores) |
| `main.tsx` | Crea todas las clases concretas y las conecta | todo |

Al ejecutar, el orden de las llamadas es UI → `GameService` → repositorio. Pero en el código **el repositorio depende del núcleo**, porque implementa la interfaz `GameRepositoryPort` que el núcleo define. Eso es la inversión de dependencias.

## 2. Clases de la arquitectura

Puertos, servicio y adaptadores. El estereotipo de cada clase (`«...»`) dice en qué parte del hexágono vive. Del dominio solo se muestran `Game` y `Board`, que es donde se conectan; el detalle está en la sección 3.

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
    -LETTERS$
    +toPosition(board: Board) PositionDataType
    -pieceCode(piece: Piece) string
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
    -game: Game
    +newGame() void
    +move(from: Square, to: Square) boolean
    +getLegalMoves(from: Square) Square[]
    +getBoard() Board
    +getTurn() Color
    +getStatus() GameStatus
  }
  class GameRepositoryPort {
    <<interface · núcleo · puerto de salida>>
    +save(game: Game) void
    +load() Game
  }
  class InMemoryGameRepository {
    <<adaptador de salida>>
    -game: Game
    +save(game: Game) void
    +load() Game
  }

  class Game {
    <<núcleo · dominio>>
  }
  class Board {
    <<núcleo · dominio>>
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
  Game *-- Board

  InMemoryGameRepository ..|> GameRepositoryPort : implementa

  main ..> ChessBoardView : crea
  main ..> GameService : crea
  main ..> InMemoryGameRepository : crea
```

## 3. Clases del dominio

Las reglas del ajedrez. No conocen ni los puertos, ni los adaptadores, ni React.

```mermaid
classDiagram
  direction TB

  class Game {
    -board: Board
    -turn: Color
    +standard()$ Game
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
    -pieces: Map~string, Piece~
    +initial()$ Board
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
    +isOnBoard() boolean
  }
  class Piece {
    <<abstract>>
    #color: Color
    +getColor() Color
    +getType()* PieceType
    +getMoves(from: Square, board: Board)* Square[]
    #slide(from, board, directions) Square[]
    #jump(from, board, offsets) Square[]
    #isEnemyAt(square: Square, board: Board) boolean
  }
  class King {
    -OFFSETS$
    +getType() PieceType
    +getMoves(from, board) Square[]
  }
  class Queen {
    -DIRECTIONS$
    +getType() PieceType
    +getMoves(from, board) Square[]
  }
  class Rook {
    -DIRECTIONS$
    +getType() PieceType
    +getMoves(from, board) Square[]
  }
  class Bishop {
    -DIRECTIONS$
    +getType() PieceType
    +getMoves(from, board) Square[]
  }
  class Knight {
    -OFFSETS$
    +getType() PieceType
    +getMoves(from, board) Square[]
  }
  class Pawn {
    +getType() PieceType
    +getMoves(from, board) Square[]
  }
  class Color {
    <<enumeration>>
    WHITE
    BLACK
  }
  class PieceType {
    <<enumeration>>
    KING
    QUEEN
    ROOK
    BISHOP
    KNIGHT
    PAWN
  }
  class GameStatus {
    <<enumeration>>
    PLAYING
    CHECK
    CHECKMATE
    STALEMATE
  }

  Game *-- Board : tiene
  Board o-- "0..32" Piece : contiene
  Piece <|-- King
  Piece <|-- Queen
  Piece <|-- Rook
  Piece <|-- Bishop
  Piece <|-- Knight
  Piece <|-- Pawn
  Game ..> GameStatus
  Game ..> Square
  Piece ..> PieceType
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
