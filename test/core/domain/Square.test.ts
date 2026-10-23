import { describe, expect, it } from 'vitest';
import { Square } from '../../../src/core/domain/Square';

describe('Square', () => {
  it('convierte entre nombre y coordenadas', () => {
    const square = Square.fromName('e2');
    expect(square.file).toBe(4);
    expect(square.rank).toBe(1);
    expect(square.name()).toBe('e2');
  });

  it('acepta casillas de tableros más grandes', () => {
    const square = Square.fromName('j10');
    expect(square.file).toBe(9);
    expect(square.rank).toBe(9);
    expect(square.name()).toBe('j10');
  });

  it('rechaza nombres inválidos', () => {
    for (const name of ['', 'e', '2e', 'E2', 'e2x']) expect(() => Square.fromName(name), name).toThrow();
  });

  it('se compara por valor', () => {
    expect(Square.fromName('a1').equals(new Square(0, 0))).toBe(true);
    expect(Square.fromName('a1').equals(Square.fromName('a2'))).toBe(false);
  });
});
