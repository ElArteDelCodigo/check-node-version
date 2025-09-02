import semver from 'semver';
import { cmd } from '../tools/Util';

export abstract class BaseApp {
  name: string;
  currentVersion: string;
  requiredVersion: string;
  executePath: string;

  constructor(name: string) {
    this.name = name;
    this.currentVersion = '';
    this.requiredVersion = '';
    this.executePath = '';
  }

  async initialize(requiredVersion: string, executePath: string) {
    this.executePath = executePath;
    this.currentVersion = await this.getVersion();
    this.requiredVersion = requiredVersion;
  }

  private async getVersion(): Promise<string> {
    try {
      const cmdResult = await cmd(`${this.name} --version`, this.executePath);
      const currentVersion = cmdResult.trim().split('\n').pop();
      return currentVersion ? currentVersion.trim().replace('v', '') : '';
    } catch (_e) {
      return '';
    }
  }

  async isValid(): Promise<boolean> {
    return semver.satisfies(this.currentVersion, this.requiredVersion);
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
