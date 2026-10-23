# Ajedrez — TP Ingeniería de Software (UADE)

Ajedrez para dos jugadores con arquitectura hexagonal. Vite + React + `react-chessboard` para la UI; el núcleo es TypeScript puro.

## Uso

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm test       # tests del núcleo (sin navegador)
pnpm typecheck
pnpm lint       # convenciones + reglas de arquitectura
```

## Estructura

```
src/
├── core/                          NÚCLEO: no importa nada de afuera
│   ├── domain/                    reglas del ajedrez
│   │   ├── Color.ts               enum
│   │   ├── Square.ts              casilla (value object)
│   │   ├── Board.ts               qué pieza hay en cada casilla; tamaño configurable
│   │   ├── Game.ts                partida: turno, movimientos legales, jaque, mate y ahogado
│   │   ├── GameStatus.ts          PLAYING, CHECK, CHECKMATE, STALEMATE
│   │   ├── pieces/                Piece (abstracta) + King, Queen, Rook, Bishop, Knight, Pawn
│   │   └── setups/                IBoardSetup + StandardSetup: tamaño y posición inicial de una variante
│   ├── ports/
│   │   ├── GameServicePort.ts     ENTRADA: lo que el núcleo ofrece
│   │   └── GameRepositoryPort.ts  SALIDA: lo que el núcleo necesita
│   └── application/
│       └── GameService.ts         implementa la entrada, usa la salida
├── adapters/                      AFUERA: lo técnico
│   ├── ui/                        adaptador de entrada (React)
│   │   ├── ChessBoardView.tsx
│   │   ├── BoardMapper.tsx        Board -> formato de react-chessboard (posición y dibujo de piezas)
│   │   └── SquareHighlighter.ts   colores de casillas: pieza elegida, destinos, rey en jaque
│   └── storage/                   adaptador de salida
│       └── InMemoryGameRepository.ts
└── main.tsx                       composition root: crea y conecta todo
test/core/                         tests del núcleo (incluye extension.test.ts: pieza nueva y tablero 10x10)
test/adapters/                     tests de los adaptadores que no necesitan navegador
```

## Dependencias: siempre hacia adentro

```
   adapters/ui                                   adapters/storage
        │ usa GameServicePort                          │ implementa GameRepositoryPort
        ▼                                              ▼
 ┌──────────────────────────── core ─────────────────────────────┐
 │  ports/GameServicePort        ports/GameRepositoryPort        │
 │           ▲ implementa                  ▲ usa                  │
 │           └──── application/GameService ┘                      │
 │                          │ usa                                 │
 │                          ▼                                     │
 │             domain/ Game, Board, Piece, Square                │
 └───────────────────────────────────────────────────────────────┘
```

| Carpeta            | Puede importar de       |
| ------------------ | ----------------------- |
| `core/domain`      | nada                    |
| `core/ports`       | `domain`                |
| `core/application` | `ports` y `domain`      |
| `adapters/*`       | `core` (nunca al revés) |
| `main.tsx`         | todo                    |

`pnpm lint` falla si alguien rompe estas reglas (ver `eslint.config.js`).

Al ejecutar, el orden es UI → GameService → repositorio, pero en el código el repositorio **depende del núcleo**: implementa la interfaz `GameRepositoryPort` que el núcleo define. Eso es la inversión de dependencias.

## Patrones

| Patrón                       | Dónde                                                                     |
| ---------------------------- | ------------------------------------------------------------------------- |
| Puertos y adaptadores        | `core/ports` + `adapters/`                                                |
| Inversión de dependencias    | `GameService` recibe un `GameRepositoryPort`, no una clase concreta       |
| Inyección por constructor    | `main.tsx` arma `GameService(repository, setup)`                          |
| Composition root             | `main.tsx`: único lugar con `new` de adaptadores                          |
| Polimorfismo / herencia      | `Piece` abstracta, cada subclase implementa `getMoves()`                  |
| Reutilización por herencia   | `Piece.slide()` y `Piece.jump()`: código común en la clase base, cada pieza pasa sus direcciones |
| Value object                 | `Square`                                                                  |
| Repository                   | `GameRepositoryPort` + `InMemoryGameRepository`                           |
| Mapper                       | `BoardMapper`                                                             |
| Abierto/cerrado              | Pieza nueva = subclase de `Piece`; variante nueva = clase `IBoardSetup`. No se toca nada existente |

## Cómo extenderlo

- **Pieza nueva:** una subclase de `Piece` con `getSymbol()` y `getMoves()`. Puede combinar movimientos ya existentes (`Knight.OFFSETS`, `Bishop.DIRECTIONS`...). La UI la dibuja con su letra.
- **Otro tablero:** una clase que implemente `IBoardSetup` y cree un `new Board(columnas, filas)` con sus piezas. Se elige en `main.tsx`.

Ejemplos de las dos cosas en `test/core/domain/extension.test.ts`.

## Pendiente

Enroque, captura al paso, coronación, tablas por repetición o regla de 50 movimientos, persistencia en `localStorage`.
