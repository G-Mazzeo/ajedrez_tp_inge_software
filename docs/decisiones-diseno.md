# Decisiones de diseño

Cada decisión tiene tres partes: **qué** elegimos, **por qué**, y **cuándo se rompería**, es decir, en qué situación dejaría de ser la mejor opción y habría que cambiarla. Las clases que se nombran están en `src/` y en el [diagrama de clases](diagrama-clases.md).

## 1. Arquitectura hexagonal: núcleo, puertos y adaptadores

- **Qué:** el código se divide en `core/` (dominio, puertos y aplicación) y `adapters/` (UI con React y guardado en `localStorage`). El núcleo define dos interfaces: `GameServicePort` (lo que ofrece) y `GameRepositoryPort` (lo que necesita). `GameService` implementa la primera y usa la segunda.
- **Por qué:** la consigna pide un núcleo que no dependa de frameworks y que se pueda probar sin infraestructura. Con los puertos, la UI y el guardado se cambian sin tocar las reglas del ajedrez. Por ejemplo, pasar de guardar en memoria a guardar en `localStorage` fue escribir un adaptador nuevo y cambiar una línea en `main.tsx`.
- **Cuándo se rompería:** si el juego necesitara algo que el núcleo no puede pedir por un puerto sin conocer la tecnología, como partidas en red con eventos en tiempo real. Ahí habría que agregar un puerto de salida para notificar (Observer) en lugar de que la UI le pregunte al servicio después de cada jugada. Y si el proyecto fuera un script descartable de una sola pantalla, esta separación sería más costo que beneficio.

## 2. Un composition root e inyección por constructor

- **Qué:** `main.tsx` es el único lugar que hace `new` de las clases concretas (`LocalStorageGameRepository`, `StandardSetup`, `GameService`, `BoardMapper`, `SquareHighlighter`) y las conecta. Cada clase recibe lo que necesita por constructor y depende de interfaces, no de clases concretas.
- **Por qué:** cambiar una pieza del sistema es cambiar una línea en un solo archivo. Además, en los tests se pasa un repositorio falso (`FakeGameRepository`) o un storage falso (`FakeStorage`) sin trucos.
- **Cuándo se rompería:** si hubiera decenas de servicios con dependencias cruzadas, armar todo a mano en `main.tsx` se volvería difícil de seguir. Ahí convendría un contenedor de inyección de dependencias. Con 5 objetos no hace falta.

## 3. Piezas: herencia para lo que son, Strategy para cómo se mueven

- **Qué:** `Piece` es abstracta y hay una subclase por pieza (`King`, `Queen`, `Rook`, `Bishop`, `Knight`, `Pawn`). Cada subclase define lo que la pieza **es**: su letra (`getSymbol()`), si es rey (`isKing()`) y si corona (`canPromote()`). Cómo **se mueve** no lo resuelve la herencia: cada subclase le pasa a `Piece` una estrategia (`IMovementStrategy`) en el constructor, y `Piece.getMoves()` le delega el cálculo.
- **Por qué:** es composición sobre herencia: el movimiento es un objeto aparte que la pieza contiene, así que una forma de moverse nueva es una clase nueva y no se toca `Piece`. Las estrategias también se prueban solas, sin piezas (`test/core/domain/movements.test.ts`). Mantener las subclases deja el código fácil de leer, porque abrir `Rook.ts` muestra todo lo que es una torre, y conserva `new Rook(color)`, que usan el setup, el repositorio y la coronación. Descartamos una sola clase `Piece` que reciba letra, estrategia y si es rey: obliga a buscar en una fábrica qué es cada pieza y suma indirección sin ganar nada para este alcance.
- **Cuándo se rompería:** con enroque o captura al paso, que necesitan historia de la partida (si el rey ya se movió, cuál fue la última jugada): con `getMoves(from, board, color)` no alcanza y habría que cambiar la interfaz para pasarle más contexto a la estrategia. También con una pieza que cambia de movimiento en plena partida sin dejar de ser la misma ("este turno el alfil salta como caballo"): habría que poder cambiar la estrategia desde afuera, o pasar a piezas sin subclases.

## 4. Estrategias con parámetros y combinables

- **Qué:** no hay una estrategia por pieza sino tres formas de moverse con parámetros: `SlideMovement(direcciones)`, `JumpMovement(saltos)` y `PawnMovement`. `CombinedMovement` suma varias estrategias y se usa como una sola (patrón Composite). Las direcciones de cada pieza (`Rook.DIRECTIONS`, `Knight.OFFSETS`...) son públicas.
- **Por qué:** torre, alfil y dama hacen el mismo recorrido y solo cambian las direcciones; con una clase por pieza se repetiría tres veces el mismo bucle. La dama no define direcciones propias: reutiliza las de la torre y el alfil. Una pieza nueva se arma sin escribir código de movimiento: el arzobispo de `extension.test.ts` es `CombinedMovement([new JumpMovement(Knight.OFFSETS), new SlideMovement(Bishop.DIRECTIONS)])`.
- **Cuándo se rompería:** si aparecieran piezas cuyo movimiento no es "deslizar" ni "saltar" ni una suma de los dos (por ejemplo, que se mueva distinto según la casilla en la que está). Esas piezas necesitan su propia estrategia, como ya pasa con el peón. Si fueran muchas, los parámetros dejarían de ahorrar código.

## 5. Preguntar a la pieza en vez de preguntar qué clase es

- **Qué:** `Game` y `Board` nunca hacen `instanceof King` ni `instanceof Pawn`. Le preguntan a la pieza: `isKing()` para el jaque y `canPromote()` para la coronación. Por defecto devuelven `false`, y solo la subclase que corresponde las cambia.
- **Por qué:** si `Game` preguntara por la clase concreta, una variante con otra pieza real o con otra pieza que corona obligaría a modificar `Game`. Así, la pieza nueva lo declara ella misma y `Game` no cambia (abierto/cerrado).
- **Cuándo se rompería:** si cada regla nueva sumara otro método booleano a `Piece` (`canCastle()`, `canBeCapturedEnPassant()`...). Con muchas reglas especiales, `Piece` se llenaría de banderas. Ahí convendría agrupar esas reglas en otro objeto o mover la lógica a estrategias.

## 6. Tablero de cualquier tamaño y posición inicial intercambiable

- **Qué:** `Board` recibe columnas y filas (8x8 por defecto) y responde `contains()`. `Square` no asume 8x8. La posición inicial la arma una clase que implementa `IBoardSetup`; `StandardSetup` es el ajedrez clásico. `GameService` recibe el setup por constructor.
- **Por qué:** la consigna avisa que en la defensa se puede pedir "cambiar el tamaño del tablero". Una variante nueva es una clase nueva que implementa `IBoardSetup`, y se elige en `main.tsx`. El peón calcula su fila inicial y la de coronación con el tamaño del tablero. Hay un ejemplo de 10x10 en `extension.test.ts`.
- **Cuándo se rompería:** si el tablero dejara de ser un rectángulo de casillas (hexagonal, con agujeros, tridimensional). `Square` como columna y fila, y `contains()` como rango, ya no alcanzarían.

## 7. Tablero como mapa de casillas ocupadas

- **Qué:** `Board` guarda solo las casillas ocupadas en un `Map<string, Piece>`, y la clave es el nombre de la casilla (`'e2'`). La pieza no sabe dónde está: lo sabe el tablero.
- **Por qué:** responder "¿qué hay en esta casilla?" es directo y no puede haber dos piezas en el mismo lugar. La clave es texto porque un `Map` compara los objetos por referencia: dos `Square` iguales serían claves distintas. Descartamos la lista de piezas, porque buscar una casilla obliga a recorrerla, y la matriz `[fila][columna]`, igual de válida pero que copia también las casillas vacías cada vez que se simula una jugada. La representación es privada: cambiarla solo tocaría `Board.ts`.
- **Cuándo se rompería:** con un motor que analice millones de posiciones por segundo. Armar textos y copiar mapas sería demasiado lento, y convendría una representación numérica aunque se lea peor.

## 8. Jaque calculado simulando sobre una copia del tablero

- **Qué:** para saber si una jugada es legal, `Game` la hace sobre una copia del tablero (`board.clone()`) y mira si el rey propio quedó atacado. "Atacado" se calcula con los mismos `getMoves()` de las piezas rivales. El estado de la partida (`PLAYING`, `CHECK`, `CHECKMATE`, `STALEMATE`) se calcula cada vez que se pide, no se guarda.
- **Por qué:** hay una sola definición de cómo se mueve cada pieza, y sirve para mover y para detectar ataques. Simular evita escribir reglas especiales para clavadas o jaques descubiertos. Como el estado no se guarda, nunca puede quedar desincronizado con el tablero. Las piezas no cambian después de creadas, así que la copia puede compartirlas.
- **Cuándo se rompería:** por rendimiento, porque cada jugada posible copia el tablero: para dos personas no se nota, pero una IA que analiza miles de posiciones tendría que hacer y deshacer jugadas sobre el mismo tablero. También por el peón, para el que moverse no es lo mismo que atacar: avanza de frente pero amenaza en diagonal. Hoy no causa ningún error, porque solo se pregunta si está atacada la casilla del rey, que siempre está ocupada. Con el enroque sí, porque hay que saber si están atacadas casillas vacías, y habría que separar "a dónde puede ir" de "qué amenaza" (por ejemplo, un `getAttacks()`).

## 9. Coronación: reemplazar la pieza, no cambiarla

- **Qué:** cuando un peón llega a la última fila, `Game` lo saca del tablero y pone en su lugar una pieza nueva del mismo color. La clase la elige el jugador; si no elige, es dama. La UI pregunta `isPromotion(from, to)` para saber cuándo mostrar las opciones. No se puede coronar a rey ni a peón.
- **Por qué:** en el ajedrez el peón no "se transforma": se cambia por otra pieza. Reemplazarla no requiere que las piezas cambien de comportamiento, y por eso no hizo falta tocar las estrategias. La última fila sale del tamaño del tablero, así que también funciona en variantes.
- **Cuándo se rompería:** si la pieza tuviera identidad propia que debe conservarse (un historial por pieza, estadísticas, animaciones que siguen al mismo objeto). Reemplazarla la perdería, y habría que cambiarle la estrategia a la misma pieza. Además, las opciones de coronación están fijas en `ChessBoardView` (`PROMOTION_OPTIONS`): si se agregan piezas nuevas seguido, conviene que lleguen desde `main.tsx`, como hoy llegan las piezas del repositorio.

## 10. Guardar la partida por la letra de cada pieza

- **Qué:** `LocalStorageGameRepository` guarda el tamaño, el turno y cada pieza como `{ casilla, color, letra }` en JSON. Al cargar, recrea cada pieza buscando su clase por la letra. Las clases que conoce se le pasan por constructor. Si lo guardado está roto o tiene una pieza desconocida, `load()` devuelve `null` y se empieza una partida nueva.
- **Por qué:** el JSON queda simple y legible, y no depende de cómo están hechas las clases por dentro. Una pieza nueva se guarda sin modificar el repositorio: alcanza con pasarle su clase. Un dato roto no rompe la aplicación.
- **Cuándo se rompería:** con dos piezas de la misma letra, porque el repositorio no sabría cuál crear. También con estado que no se ve en el tablero (si el rey ya se movió, para el enroque; la última jugada, para la captura al paso): habría que guardar más datos y versionar el formato.

## 11. La UI traduce, no decide

- **Qué:** `ChessBoardView` convierte clics y arrastres en llamadas a `GameServicePort` y muestra lo que el núcleo responde. `BoardMapper` traduce `Board` al formato de `react-chessboard`, y `SquareHighlighter` elige el color de cada casilla marcada. Una pieza que la librería no conoce se dibuja con su letra.
- **Por qué:** ninguna regla del ajedrez vive en la UI: si una jugada vale, lo dice el núcleo. Así se podría cambiar de librería de tablero, o hacer una versión de consola, sin reescribir reglas. Que las piezas nuevas se dibujen solas evita tocar la UI al extender el juego.
- **Cuándo se rompería:** si la UI tuviera que mostrar información que el núcleo no expone (por ejemplo, la lista de jugadas en notación), habría que ampliar el puerto de entrada. Y si el núcleo pasara a correr en un servidor (partidas en línea), la UI ya no podría llamar al servicio directamente: haría falta un adaptador que implemente `GameServicePort` con llamadas por red.

## 12. Tests del núcleo sin infraestructura

- **Qué:** los tests usan Vitest y corren en Node, sin navegador. Los puertos se reemplazan por implementaciones falsas escritas en el mismo test. Hay tests por pieza, por estrategia, de jaque y mate, de coronación, del servicio, de los adaptadores, y de extensión (pieza nueva y tablero 10x10).
- **Por qué:** la consigna pide probar el núcleo sin levantar infraestructura. Los tests de extensión prueban lo que se evalúa en la defensa: que se puede agregar una pieza o cambiar el tablero sin modificar clases existentes.
- **Cuándo se rompería:** los tests no prueban la interacción real con el tablero en el navegador (arrastrar, el diálogo de coronación). Si la UI creciera, harían falta tests de punta a punta.

## 13. Patrones que no usamos: State, Command y Observer

- **Qué:** el estado de la partida es un enum calculado (`GameStatus`), no un objeto State. Las jugadas se aplican directamente sobre el tablero, sin objetos Command ni historial. El núcleo no publica eventos: la UI le pregunta al servicio después de cada jugada.
- **Por qué:** cada patrón sumaría clases sin resolver un problema que hoy exista. La partida solo se comporta distinto cuando terminó, así que con State habría varias clases casi vacías. Deshacer no está en el alcance, y Command solo se justifica con deshacer. Hay un solo consumidor, la UI, y solo cambia cuando ella misma hace una jugada, así que no hay nadie más a quien avisarle.
- **Cuándo se rompería:** State, si cada fase tuviera comportamiento propio (reloj, oferta de tablas). Command, si se agregara deshacer o reproducir partidas. Observer, si hubiera varios consumidores que reaccionan a la misma jugada (sonido, historial) o partidas en red, donde el tablero cambia sin que la UI haya hecho nada.
