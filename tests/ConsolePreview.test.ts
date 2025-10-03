import path from 'path';
import { Project } from '../src/models/Project';
import { reset } from '../src/tools/colors';
import { attachStdoutSpy } from './helpers/stdout';

const logWithTimestamp = (text: string) => {
  const time = new Date().toTimeString().split(' ')[0];
  text.split('\n').forEach((line) => {
    process.stdout.write(`[${time}] ${line}\n`);
  });
};

describe('Vista previa por consola', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('1970-01-01T12:55:43'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('muestra la salida de consola esperada', async () => {
    const stdout = attachStdoutSpy();
    let rawOutput = '';
    const shouldPreview = process.env.SHOW_TEST_STDOUT === '1';

    try {
      const projectPath = path.resolve(__dirname, 'app-sample/mismatched');
      const project = new Project(projectPath);
      await project.initialize();
      await project.checkVersion();

      rawOutput = stdout.getOutput().replace(/\r/g, '');
    } finally {
      stdout.mockRestore();
    }

    if (shouldPreview) {
      logWithTimestamp(rawOutput.trimEnd());
    }

    const newlineMatches = [...rawOutput.matchAll(/\n/g)].map(
      (match) => match.index ?? -1,
    );
    newlineMatches.forEach((newlineIndex) => {
      expect(newlineIndex).toBeGreaterThanOrEqual(reset.length);
      const segment = rawOutput.slice(
        newlineIndex - reset.length,
        newlineIndex,
      );
      expect(segment).toBe(reset);
    });
  });
});
