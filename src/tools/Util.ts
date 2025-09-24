import { exec, ExecException } from 'child_process';
import { reset } from './colors';

export const cmd = (command: string, executePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(
      command,
      { cwd: executePath },
      (error: ExecException | null, stdout: string, stderr: string) => {
        if (error) reject(stderr);
        if (!error) resolve(stdout);
      },
    );
  });
};

export const OK = `${process.platform === 'linux' ? '\u2713' : 'ok'}`;
export const FAIL = `${process.platform === 'linux' ? '\u2715' : 'x'}`;

export const printWithColor = (msg: string) => {
  const msgWithColor = msg.replace(/\n/g, `\n${reset}`);
  process.stdout.write(reset + msgWithColor + reset);
};
