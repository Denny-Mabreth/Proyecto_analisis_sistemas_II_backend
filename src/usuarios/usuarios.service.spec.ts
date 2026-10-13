import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from './usuarios.service.js';

describe('Usuarios Password Hashing', () => {
  it('should hash password and verify successfully', () => {
    const raw = '1234';
    const hash = hashPassword(raw);

    expect(hash).not.toBe(raw);
    expect(hash.includes(':')).toBe(true);

    const isMatch = comparePassword('1234', hash);
    expect(isMatch).toBe(true);

    const isWrong = comparePassword('wrong-password', hash);
    expect(isWrong).toBe(false);
  });
});
