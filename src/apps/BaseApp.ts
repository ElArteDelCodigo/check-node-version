import semver from 'semver';
import { cmd, FAIL, OK } from '../tools/Util';

export abstract class BaseApp {
  name: string;
  currentVersion: string;
  requiredVersion: string;

  constructor(name: string) {
    this.name = name;
    this.currentVersion = '';
    this.requiredVersion = '';
  }

  async initialize(requiredVersion: string) {
    this.currentVersion = await this.getVersion();
    this.requiredVersion = requiredVersion;
  }

  private async getVersion(): Promise<string> {
    try {
      const cmdResult = await cmd(`${this.name} --version`, process.cwd());
      const currentVersion = cmdResult.trim().split('\n').pop();
      return currentVersion ? currentVersion.trim().replace('v', '') : '';
    } catch (e) {
      return '';
    }
  }

  async isValid(): Promise<boolean> {
    return semver.satisfies(this.currentVersion, this.requiredVersion);
  }

  printCheckValidMessage(padLength: number): void {
    const appNamePadded = (this.name + ':').padEnd(padLength, ' ');
    const currentVersionPadded = this.currentVersion.padStart(8, ' ');
    process.stdout.write(`\x1b[32m${appNamePadded} ${currentVersionPadded} ${OK}  versión requerida: ${this.requiredVersion}\x1b[0m\n`);
  }

  printCheckErrorMessage(padLength: number): void {
    const appNamePadded = (this.name + ':').padEnd(padLength, ' ');
    const currentVersionPadded = this.currentVersion.padStart(8, ' ');
    process.stdout.write(`\x1b[31m${appNamePadded} ${currentVersionPadded} ${FAIL}  versión requerida: ${this.requiredVersion}\x1b[0m\n`);
  }

  getInstallMsg(): string {
    return `npm install -g ${this.name}@1.0.0`;
  }

  getInstallInfoMsg(): string {
    return '';
  }

  getVersionMsg(): string {
    return `${this.name} --version`;
  }
}
