import { printWithColor } from '../src/tools/Util';
import { green, lightBlue, reset } from '../src/tools/colors';
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

  test('inserta reset ((\\x1b[0m)) antes y después de cada salto de línea (protege prefijos externos)', () => {
    const stdout = attachStdoutSpy();

    try {
      printWithColor(`${lightBlue}Hola\n${green}Mundo\n`);
    } finally {
      stdout.mockRestore();
    }

    const printed = stdout.getOutput();
    const newlineCount = (printed.match(/\n/g) ?? []).length;

    const resetBeforeCount = printed.split(`${reset}\n`).length - 1;
    const resetAfterCount = printed.split(`\n${reset}`).length - 1;

    expect(resetBeforeCount).toBe(newlineCount);
    expect(resetAfterCount).toBe(newlineCount);

    const legacyOutput =
      reset + `${lightBlue}Hola\n${green}Mundo\n`.replace(/\n/g, `\n${reset}`) + reset;
    const legacyResetBeforeCount = legacyOutput.split(`${reset}\n`).length - 1;

    expect(legacyResetBeforeCount).toBe(0);
  });

  test('arroja error si stdout.write no inicia con reset (\\x1b[0m)', () => {
    const stdout = attachStdoutSpy();

    expect(() => process.stdout.write('Hola sin reset')).toThrow(
      /debe iniciar con el código reset/i,
    );

    stdout.mockRestore();
  });
});
