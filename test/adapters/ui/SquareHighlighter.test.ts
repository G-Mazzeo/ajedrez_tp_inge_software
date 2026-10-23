import { describe, expect, it } from 'vitest';
import { SquareHighlighter } from '../../../src/adapters/ui/SquareHighlighter';
import { StandardSetup } from '../../../src/core/domain/setups/StandardSetup';
import { Square } from '../../../src/core/domain/Square';

const at = (name: string): Square => Square.fromName(name);

describe('SquareHighlighter', () => {
  const highlighter = new SquareHighlighter();
  const board = new StandardSetup().create();

  it('sin selección ni jaque no pinta nada', () => {
    expect(highlighter.highlight(board, null, [], undefined)).toEqual({});
  });

  it('pinta la pieza elegida y sus destinos', () => {
    const styles = highlighter.highlight(board, at('e2'), [at('e3'), at('e4')], undefined);
    expect(Object.keys(styles).sort()).toEqual(['e2', 'e3', 'e4']);
    expect(styles.e3).toEqual(styles.e4);
    expect(styles.e2).not.toEqual(styles.e3);
  });

  it('marca distinto un destino donde hay que comer', () => {
    const styles = highlighter.highlight(board, at('e2'), [at('e3'), at('d7')], undefined);
    expect(styles.d7).not.toEqual(styles.e3);
  });

  it('pinta al rey en jaque', () => {
    const styles = highlighter.highlight(board, null, [], at('e1'));
    expect(Object.keys(styles)).toEqual(['e1']);
  });
});
