import { reset } from '../../src/tools/colors';

const originalStdoutWrite: typeof process.stdout.write =
  process.stdout.write.bind(process.stdout);
const mirrorStdout = process.env.SHOW_TEST_STDOUT === '1';

const toText = (
  chunk: Parameters<typeof process.stdout.write>[0],
  encoding: Parameters<typeof process.stdout.write>[1],
) => {
  const encodingOption = typeof encoding === 'string' ? encoding : undefined;

  if (typeof chunk === 'string') {
    return chunk;
  }

  if (Buffer.isBuffer(chunk)) {
    return chunk.toString(encodingOption);
  }

  if (chunk instanceof Uint8Array) {
    return Buffer.from(chunk).toString(encodingOption);
  }

  return String(chunk);
};

const ensureLinesStartWithReset = (text: string) => {
  const lines = text.split('\n').filter((line) => line.length > 0);

  for (const line of lines) {
    if (!line.startsWith(reset)) {
      throw new Error(
        `Cada línea enviada a stdout debe iniciar con el código reset (\\x1b[0m). Recibido: ${JSON.stringify(
          line,
        )}`,
      );
    }
  }
};

type StdoutWriteParams = Parameters<typeof process.stdout.write>;

export const attachStdoutSpy = (collect?: (text: string) => void) => {
  let output = '';

  const spy = jest
    .spyOn(process.stdout, 'write')
    .mockImplementation((...args: StdoutWriteParams) => {
      const [chunk, encoding] = args;
      const text = toText(chunk, encoding);

      ensureLinesStartWithReset(text);

      output += text;
      if (collect) {
        collect(text);
      }

      if (mirrorStdout) {
        originalStdoutWrite.apply(process.stdout, args);
      }

      return true;
    });

  return {
    getOutput: () => output,
    mockRestore: () => spy.mockRestore(),
  };
};

export const expectStdoutLineGuard = (text: string) => {
  ensureLinesStartWithReset(text);
};
