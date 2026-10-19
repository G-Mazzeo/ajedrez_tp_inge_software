import { describe, expect, it } from 'vitest';
import { Square } from '../../../src/core/domain/Square';

describe('Square', () => {
  it('convierte entre nombre y coordenadas', () => {
    const square = Square.fromName('e2');
    expect(square.file).toBe(4);
    expect(square.rank).toBe(1);
    expect(square.name()).toBe('e2');
  });

  it('se compara por valor', () => {
    expect(Square.fromName('a1').equals(new Square(0, 0))).toBe(true);
    expect(Square.fromName('a1').equals(Square.fromName('a2'))).toBe(false);
  });

  it('sabe si está dentro del tablero', () => {
    expect(Square.fromName('h8').isOnBoard()).toBe(true);
    expect(Square.fromName('h8').offset(1, 0).isOnBoard()).toBe(false);
  });
});
