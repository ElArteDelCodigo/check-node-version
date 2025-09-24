import { printWithColor } from '../src/tools/Util';
import { reset } from '../src/tools/colors';
import { attachStdoutSpy } from './helpers/stdout';

describe('printWithColor', () => {
  test('garantiza que cada salida comience con reset', () => {
    const stdout = attachStdoutSpy();

    try {
      printWithColor('Hola\nMundo');
    } finally {
      stdout.mockRestore();
    }

    const printed = stdout.getOutput();
    const nonEmptyLines = printed
      .split('\n')
      .filter((line) => line.trim().length > 0);

    nonEmptyLines.forEach((line) => {
      expect(line.startsWith(reset)).toBe(true);
    });
  });

  test('arroja error si stdout.write no inicia con reset (\\x1b[0m)', () => {
    const stdout = attachStdoutSpy();

    expect(() => process.stdout.write('Hola sin reset')).toThrow(
      /debe iniciar con el código reset/i,
    );

    stdout.mockRestore();
  });
});
